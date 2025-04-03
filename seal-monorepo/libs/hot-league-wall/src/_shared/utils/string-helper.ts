interface String {
    replaceTolgeeFormat(): string;
    capitalizeFirstLetter(): string;
}

String.prototype.replaceTolgeeFormat = function () {
    return this.replaceAll('%', '').replaceAll('(%', '(').replaceAll('#%', '#');
};
String.prototype.capitalizeFirstLetter = function () {
    const regex = /(^|\s)[a-z]/g;
    return this.toLowerCase().replace(regex, (letter) => letter.toUpperCase());
};
