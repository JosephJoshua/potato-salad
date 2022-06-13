export default async func => {

    const startTime = performance.now();
    await func();
    const endTime = performance.now();

    return Math.ceil(endTime - startTime);
};
