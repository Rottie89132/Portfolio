<template>
    <div class=" md:max-h-64" v-if="!showLoading">
        <ChartVisitsDark :chartData :chartOptions v-if="isDark" />
        <ChartVisitsLight :chartData :chartOptions v-else />
    </div>
    <div v-else class=" flex justify-center flex-col">
        <div class=" flex justify-between items-center xl:-mb-2">
            <p class="dark:text-white font-black mb-1">Bezig met laden...</p>
            <icon name="mingcute:loading-fill" size="2em" class="animate-spin text-indigo-500" />
        </div>
        <p class=" text-sm dark:text-gray-300 text-gray-600 mb-3 text-balance">
            De bezoekersgegevens worden opgehaald. Een moment geduld aub.
        </p>
    </div>
</template>



<script setup>

    const showLoading = ref(true);
    const probs = defineProps({
        Analytics: Object
    }); 

    const colormode = useColorMode();
    const isDark = computed(() => colormode.value === 'dark');
    
    const monthNames = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
    const chartData = computed(() => {
        return {
            labels: probs.Analytics.result.map(item => `${monthNames[item.CurrentMonth - 1]} ${item.CurrentYear}`),
            datasets: [
                {
                    label: 'Bezoekers',
                    backgroundColor: '#6366F1',
                    data: probs.Analytics.result.map(item => item.MonthlyVisted)
                },
            ]
        };
    });

    const chartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    boxWidth: 12,
                }
            },
        },
        layout: {
            padding: 0,
        },
        responsive: true

    }

    setTimeout(() => {
        showLoading.value = false;
    }, 1000);

</script>
