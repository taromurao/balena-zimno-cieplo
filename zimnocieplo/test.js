async function sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
}

async function test() {
    await sleep(1000);
    await test();
}
(async () => {
    await test();
})();