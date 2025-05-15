import 'libs/saba-games/src/_shared/utils/string-helper';

describe('string-helper', () => {
    describe('replaceTolgeeFormat', () => {
        it('should remove standalone % characters', () => {
            const input = 'Hello%World';
            const expected = 'HelloWorld';
            expect(input.replaceTolgeeFormat()).toBe(expected);
        });

        it('should replace (% with (', () => {
            const input = 'Hello(%World)';
            const expected = 'Hello(World)';
            expect(input.replaceTolgeeFormat()).toBe(expected);
        });

        it('should replace #% with #', () => {
            const input = 'Hello#%World';
            const expected = 'Hello#World';
            expect(input.replaceTolgeeFormat()).toBe(expected);
        });

        it('should handle multiple replacements in the same string', () => {
            const input = 'Hello%World(%Test)#%123';
            const expected = 'HelloWorld(Test)#123';
            expect(input.replaceTolgeeFormat()).toBe(expected);
        });

        it('should handle empty string', () => {
            const input = '';
            const expected = '';
            expect(input.replaceTolgeeFormat()).toBe(expected);
        });

        it('should handle string with no replacements needed', () => {
            const input = 'Hello World';
            const expected = 'Hello World';
            expect(input.replaceTolgeeFormat()).toBe(expected);
        });
    });

    describe('capitalizeFirstLetter', () => {
        it('should capitalize first letter of each word', () => {
            const input = 'hello world';
            const expected = 'Hello World';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle single word', () => {
            const input = 'hello';
            const expected = 'Hello';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle multiple spaces between words', () => {
            const input = 'hello   world';
            const expected = 'Hello   World';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle leading and trailing spaces', () => {
            const input = '  hello world  ';
            const expected = '  Hello World  ';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle empty string', () => {
            const input = '';
            const expected = '';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle already capitalized words', () => {
            const input = 'Hello World';
            const expected = 'Hello World';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle mixed case words', () => {
            const input = 'hElLo wOrLd';
            const expected = 'Hello World';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });

        it('should handle special characters', () => {
            const input = 'hello-world test123';
            const expected = 'Hello-world Test123';
            expect(input.capitalizeFirstLetter()).toBe(expected);
        });
    });
}); 
