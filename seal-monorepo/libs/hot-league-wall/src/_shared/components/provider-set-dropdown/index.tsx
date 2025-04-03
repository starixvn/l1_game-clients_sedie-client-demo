import { locales } from '../../constants';
import { usePreviewContext } from '../../../previewProvider';

export enum dataTheme {
    DEFAULT = 'default',
    DARK = 'dark', // member site uses 'dark'
    LIGHT01 = 'light-01',
    LIGHT02 = 'light-02',
    LIGHT03 = 'light-03',
    DARK01 = 'dark-01',
    DARK02 = 'dark-02',
    DARK03 = 'dark-03',
}

const ProviderSetDropDown = () => {
    const { theme, setTheme, isDarkMode ,setIsDarkMode, language, setLanguage } = usePreviewContext();

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTheme = e.target.value as dataTheme;
        const isDarkMode = selectedTheme === dataTheme.DARK;
    
        setIsDarkMode(isDarkMode);
    
        const themeToSet = isDarkMode ? dataTheme.DEFAULT : selectedTheme;
        setTheme(themeToSet);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = e.target.value;
        setLanguage(selectedLanguage);
    };

    const displayTheme = isDarkMode ? dataTheme.DARK : theme;

    return (
        <div>
            <label htmlFor="theme-select">Select Theme: </label>
            <select 
                id="theme-select"
                value={displayTheme}
                onChange={handleThemeChange}
            >
                {Object.values(dataTheme).map((themeOption) => (
                    <option key={themeOption} value={themeOption}>
                        {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                    </option>
                ))}
            </select>

            <label htmlFor="theme-select">Select Langue: </label>
            <select 
                id="theme-select"
                value={language}
                onChange={handleLanguageChange}
            >
                {Object.entries(locales).map(([key, value]) => (
                    <option key={key} value={value}>
                        {value}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ProviderSetDropDown;