import { Page } from "@playwright/test";

export default class TextUtils {

    constructor(public page: Page) { }

    async get_text_between_words(str: string, first_word: string, second_word: string) {
        // sample, gets the following text: "..<first_word> <get this text> <second_word>.."

        // extract string after 'first_word' 

        const index1: number = await str.indexOf(first_word);

        const size1: number = await first_word.length;

        const resultAfter: string = await str.slice(index1 + size1);

        // extract string before 'second_word'   

        const textArray = await resultAfter.split(second_word);

        let result = await textArray.shift();

        return result
    }

}