export default class Helpers {

    static getRandomIntInRange = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

    static reduceArrayToSomeRandomItems = (array, numberOfItems) => {
        return array.sort(() => 0.5 - Math.random()).slice(0, numberOfItems);
    };

    static isDev = () => {
        return __ENV__ === 'dev';
    };

    static isProd = () => {
        return !this.isDev();
    }
}
