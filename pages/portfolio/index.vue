<template>
	<div>
		<VitePwaManifest />
		<Landscape />
		<div class="fixed w-full h-full p-4 pb-5 md:pb-0 md:p-0 select-none">
			<div :class="!Installed ? 'h-full' : 'h-[95%]'" class="w-full md:h-full p-5 md:rounded-none rounded-3xl md:pl-8 lg:pl-36 xl:pl-52 bg-gradient-to-r from-teal-50 to-yellow-50 dark:from-[#131313] dark:to-[#22221E]">
				<div class="grid gap-24">
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
					<div class="items-center w-full h-[60vh] md:flex z-10">
						<div class="grid gap-8 md:gap-4">
							<HeaderTitel Title="Hallo leer mij kennen!" SubTitle="Hoi, ik ben Roland Meijer, een gemotiveerde Software Developer. Met een sterke basis in programmeren en een passie voor technologie!" />
							<div class="flex items-center gap-5">
								<ClientOnly>
									<NuxtLink :to="repoLink" class="flex dark:text-neutral-800 font-semibold dark:bg-white dark:hover:bg-gray-50 dark:hover:ring-gray-50 dark:ring-white items-center gap-2 px-5 py-3 text-sm text-white bg-neutral-800 hover:bg-neutral-900 ring-2 hover:ring-neutral-900 ring-neutral-800 rounded-xl"> Bekijk projecten </NuxtLink>
									<template #fallback>
										<NuxtLink to="/Repos" class="flex dark:text-neutral-800 font-semibold dark:bg-white dark:hover:bg-gray-50 dark:hover:ring-gray-50 dark:ring-white items-center gap-2 px-5 py-3 text-sm text-white bg-neutral-800 hover:bg-neutral-900 ring-2 hover:ring-neutral-900 ring-neutral-800 rounded-xl"> Bekijk projecten </NuxtLink>
									</template>
								</ClientOnly>

								<button @click="HandleModule('Contact')" class="px-6 py-3 dark:hover:text-gray-50 dark:ring-white dark:hover:ring-gray-50 text-sm font-semibold dark:text-white text-neutral-800 hover:text-neutral-900 ring-2 ring-neutral-800 hover:ring-neutral-900 rounded-xl">Maak contact</button>
							</div>
						</div>
					</div>
					<DotPattern class="hidden md:inline" :width="10" :height="10" :class="cn('[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]')" />
				</div>
			</div>
		</div>
		<ModalAuth v-model:type="datatype" v-model:texthead="title" v-model:textbase="subtitle" v-model:status="OpenModule" v-model:DelayStatus="OpenModuleDelay" v-model:textLabel="buttonLabel" v-model:AuthModule="AuthModule"> </ModalAuth>
	</div>
</template>

<script setup>
	useSeoMeta({
		title: "PortFolio - Home",
		description: "Welkom op de startpagina van mijn portfolio-website! Neem gerust een kijkje en laat een berichtje achter!",
		ogTitle: "PortFolio",
		ogDescription: "Welkom op de startpagina van mijn portfolio-website! Neem gerust een kijkje en laat een berichtje achter!",
		ogImage: "/icons/test.png",
		ogUrl: "/",
		twitterTitle: "PortFolio",
		twitterDescription: "Welkom op de startpagina van mijn portfolio-website! Neem gerust een kijkje en laat een berichtje achter!!",
		twitterImage: "/icons/test.png",
		twitterCard: "summary",
	});

	useHead({
		htmlAttrs: { lang: "nl" },
		link: [{ rel: "icon", type: "image/png" }],
	});

	const { $pwa, $PusherOnStart, $csrfFetch } = useNuxtApp();
	const subject = encodeURIComponent("Contactverzoek via Portfolio");

	const OpenModule = ref(false);
	const OpenModuleDelay = ref(false);
	const AuthModule = ref(true);
	const title = ref("");
	const subtitle = ref("");
	const buttonLabel = ref("");
	const textLabel = ref("Inloggen");
	const Installed = ref(false);
	const datatype = ref("");
	const repoLink = ref("");
	const currentPage = useLocalStorage("RepoPage").value;
	repoLink.value = `/Repos?Page=${currentPage || 1}`;

	const CVLink = ref("./file/roland-cv.pdf");
	const TelLink = ref("tel:+31638305453");
	const MailLink = ref(`mailto:rolandmeijer03@gmail.com?subject=${subject}`);

	const store = useSessionsStore();
	const data = ref(await store.getSession());

	if (useRoute().query.Page) navigateTo("/portfolio");
	const Logout = async () => {
		store.clearSession();
		await $csrfFetch("/api/users", { method: "DELETE" });
		data.value = null;
	};

	onMounted(() => {
		if ($pwa.isInstalled) Installed.value = true;
		$PusherOnStart();
	});

	const HandleModule = async (type) => {
		datatype.value = type;
		AuthModule.value = type != "Contact";
		title.value = type;
		buttonLabel.value = type == "Contact" ? "Maak contact" : "Login";
		subtitle.value = type == "Contact" ? "Vul hieronder je contact gegevens in en laat een bericht achter." : "Vul hieronder je gebruikersnaam en wachtwoord in om toegang te krijgen tot je account.";

		OpenModule.value = true;
		setTimeout(() => {
			OpenModuleDelay.value = true;
		}, 100);
	};
</script>
