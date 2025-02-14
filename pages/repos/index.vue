<template>
	<div>
		<VitePwaManifest />
		<Landscape />
		<div class="fixed w-full select-none h-full p-4 pb-5 md:pb-0 md:p-0">
			<div :class="!Installed ? 'h-full' : 'h-[95%]'" class="w-full md:h-full p-5 md:rounded-none pb-4 rounded-3xl md:pl-8 lg:pl-36 xl:pl-52 bg-[#f0f0f0] md:bg-white dark:bg-[#131313] dark:md:bg-neutral-900 overflow-auto">
				<div class="grid gap-24 md:sticky top-0 w-full ">
					<div class="flex items-center justify-between">
						<Navigation :data />
						<div class="flex gap-4 items-center">
							<ClientOnly>
								<ColorMode />
								<Online />
								<button v-if="data?.statusCode == 200" @click="Logout" class="px-6 py-1 dark:text-neutral-800 font-semibold dark:bg-white dark:hover:bg-gray-50 dark:hover:ring-gray-50 dark:ring-white text-white rounded-lg bg-neutral-800 hover:bg-neutral-900 ring-2 ring-neutral-800 hover:ring-neutral-900">Uitloggen</button>
								<button v-else @click="HandleModule('Inloggen')" class="px-6 py-1 dark:text-neutral-800 font-semibold dark:bg-white dark:hover:bg-gray-50 dark:hover:ring-gray-50 dark:ring-white text-white rounded-lg bg-neutral-800 hover:bg-neutral-900 ring-2 ring-neutral-800 hover:ring-neutral-900">{{ textLabel }}</button>
							</ClientOnly>
						</div>
					</div>
				</div>
				<div class="w-full h-fit mt-6 md:mt-10 xl:mt-20 md:w-[98%] lg:w-[88%] xl:w-[89.2%]">
					<div class="flex items-center justify-between gap-3 mb-3">
						<h1 class="text-[1.5em] text-black dark:text-white font-extrabold">Repositories</h1>
						<PaginationButtons :items :hidebuttons :loading v-model:currentPage="currentPage" :PreviousPage :NextPage :navigateToPage> </PaginationButtons>
					</div>
					<CardDisplay :items :loadingIndicater  />
				</div>
			</div>
		</div>
		<ModalAuth v-model:type="datatype" v-model:texthead="title" v-model:textbase="subtitle" v-model:status="OpenModule"
			v-model:DelayStatus="OpenModuleDelay" v-model:textLabel="buttonLabel" v-model:AuthModule="AuthModule">
		</ModalAuth>
	</div>
</template>

<script setup>

	const { $pwa, $PusherOnStart, $PusherOnEvent, $csrfFetch } = useNuxtApp();
	const items = ref([]);
	const currentPage = ref();
	const router = useRouter();
	const OpenModule = ref(false);
	const OpenModuleDelay = ref(false);
	const AuthModule = ref(true);
	const title = ref("");
	const subtitle = ref("");
	const buttonLabel = ref("");
	const textLabel = ref("Inloggen");
	const Repos = ref([]);
	const hidebuttons = ref([]);
	const loading = ref(false);
	const Installed = ref(false);
	const ReactiveEvent = ref(false);
	const loadingIndicater = ref(true);
	const datatype = ref("");

	definePageMeta({
		middleware: "analytics",
	})

	useSeoMeta({
		title: `PortFolio - Repositories`,
		description: "Hier vind je een overzicht van al mijn repositories!",
		ogTitle: "PortFolio",
		ogDescription: "Hier vind je een overzicht van al mijn repositories!",
		ogImage: "/icons/test.png",
		ogUrl: "/",
		twitterTitle: "PortFolio",
		twitterDescription: "Hier vind je een overzicht van al mijn repositories!",
		twitterImage: "/icons/test.png",
		twitterCard: "summary",
	});

	useHead({
		htmlAttrs: { lang: "nl" },
		link: [{ rel: "icon", type: "image/png" }],
	});

	onMounted(async () => {
		if ($pwa.isInstalled) Installed.value = true;
		$PusherOnStart();
		$PusherOnEvent("client-eventRepositories", ReactiveEvent);
	});

	currentPage.value = useRoute().query.Page ? Number(useRoute().query.Page) : 1;

	const store = useSessionsStore()
	const data = ref(await store.getSession())

	const Logout = async () => {
		store.clearSession();
		await $csrfFetch("/api/users", { method: "DELETE" });
		return navigateTo("/");
	};

	const navigateToPage = async () => {
		if (currentPage.value > hidebuttons.value.total) currentPage.value = hidebuttons.value.total;
		else if (currentPage.value < 1) currentPage.value = 1;

		useLocalStorage("RepoPage").value = currentPage.value;
		router.push({ path: "/Repos", query: { Page: currentPage.value } });

		const Repositories = await $fetch(`/api/repo/${currentPage.value}`);
		loadedRepos(Repositories);
	};

	const PreviousPage = async () => {
		const page = useLocalStorage("RepoPage");

		if (page.value == 1) page.value = hidebuttons.value.total;
		else page.value = Number(page.value) - 1;

		router.push({ path: "/Repos", query: { Page: page.value } });
		currentPage.value = page.value;

		const Repositories = await $fetch(`/api/repo/${page.value}`);
		loadedRepos(Repositories);
	};

	const NextPage = async () => {
		const page = useLocalStorage("RepoPage");

		if (page.value >= hidebuttons.value.total) page.value = 1;
		else page.value = Number(page.value) + 1;

		router.push({ path: "/Repos", query: { Page: page.value } });
		currentPage.value = page.value;

		const Repositories = await $fetch(`/api/repo/${page.value}`);
		loadedRepos(Repositories);
	};

	const HandleModule = (type) => {
		console.log(type);
		datatype.value = type;
		AuthModule.value = true;
		title.value = type;
		buttonLabel.value = "Login";
		subtitle.value = "Vul hieronder je gebruikersnaam en wachtwoord in om toegang te krijgen tot je account.";

		OpenModule.value = true;
		setTimeout(() => {
			OpenModuleDelay.value = true;
		}, 100);
	};

	const animateIn = () => {
		loading.value = true;
		setTimeout(() => {
			items.value.forEach((item, index) => {
				setTimeout(() => {
					item.loaded = true;
				}, index * 200);
			});
		}, 250);

		setTimeout(() => {
			loading.value = false;
		}, 500);
	};

	const loadedRepos = async (Repositories) => {
		items.value = [];
		Repos.value = Repositories?.Response;
		hidebuttons.value = Repositories;

		if (Repos.value) {
			currentPage.value = Repositories.page;
			useLocalStorage("RepoPage").value = Repositories.page;

			Repos.value.forEach((item) => {
				items.value.push({ ...item, loaded: false });
			});
		} else if (currentPage.value != 1) {
			currentPage.value = 1;
			useLocalStorage("RepoPage").value = 1;
			const Repositories = await $fetch(`/api/repo/${currentPage.value}`);
			router.push({ path: "/Repos", query: { Page: currentPage.value } });

			Repos.value = Repositories?.Response;
			hidebuttons.value = Repositories;

			if (Repos.value) {
				currentPage.value = Repositories.page;
				useLocalStorage("RepoPage").value = Repositories.page;
				Repos.value.forEach((item) => {
					items.value.push({ ...item, loaded: false });
				});
			}
		}
		animateIn();
	};

	watch(ReactiveEvent, async () => {
		const Repositories = await $fetch(`/api/repo/${useRoute().query.Page}`);
		loadedRepos(Repositories);
	});

	if (document) {
		setTimeout(async () => {
			const { data: Repositories } = await useCsrfFetch(`/api/repo/${currentPage.value}`);

			hidebuttons.value = Repositories.value;
			loadedRepos(Repositories.value);
			loadingIndicater.value = false;
		}, 100);
	}
</script>

<style scoped>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fade-in {
		animation: fadeIn 0.5s ease-out;
	}

	::-webkit-scrollbar {
		@apply hidden;
	}

	.tooltip::after {
		@apply absolute top-full left-10 border-[5px];
		content: "";
		margin-left: -5px;
		border-style: solid;
		border-color: #3182ce transparent transparent transparent;
	}
</style>
