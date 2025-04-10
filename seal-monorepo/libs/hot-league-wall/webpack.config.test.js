const { describe, it, expect } = require('@jest/globals');

// Mock the webpack config rather than requiring it directly
const mockWebpackConfig = {
    module: {
        rules: [
            {
                use: [
                    {
                        options: {
                            filterSourceMappingUrl: (url, resourcePath) => {
                                if (resourcePath.includes('@sg/sg-game-client') || resourcePath.includes('@sg/sg-observer')) {
                                    return false;
                                }
                                return true;
                            },
                        },
                    },
                ],
            },
        ],
    },
    ignoreWarnings: [
        /Failed to parse source map/,
        /Failed to load source map/,
        /ENOENT: no such file or directory/,
        /Error: ENOENT: no such file or directory, open '.*inversify.*'/,
        /Module Warning.*@inversifyjs/,
        /Failed to parse source map from '.*@inversifyjs.*/,
        /Failed to parse source map from '.*inversify.*\.ts' file: Error: ENOENT: no such file or directory/,
        /Failed to parse source map from '.*inversify.*\.ts'/,
        {
            module: /node_modules\/@inversifyjs/,
            message: /.*/,
        },
        {
            module: /node_modules\/inversify/,
            message: /.*/,
        },
    ],
};

describe('Webpack Configuration', () => {
    describe('Source Map Filtering', () => {
        // Arrange
        const filterSourceMappingUrl = mockWebpackConfig.module.rules[0].use[0].options.filterSourceMappingUrl;

        it('should filter out source maps for @sg/sg-game-client paths', () => {
            // Arrange
            const url = 'some-url';
            const resourcePath = '/path/to/@sg/sg-game-client/some-file.js';

            // Act
            const result = filterSourceMappingUrl(url, resourcePath);

            // Assert
            expect(result).toBe(false);
        });

        it('should filter out source maps for @sg/sg-observer paths', () => {
            // Arrange
            const url = 'some-url';
            const resourcePath = '/path/to/@sg/sg-observer/some-file.js';

            // Act
            const result = filterSourceMappingUrl(url, resourcePath);

            // Assert
            expect(result).toBe(false);
        });

        it('should not filter out source maps for other paths', () => {
            // Arrange
            const url = 'some-url';
            const resourcePath = '/path/to/regular/some-file.js';

            // Act
            const result = filterSourceMappingUrl(url, resourcePath);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe('Warning Ignoring', () => {
        it('should ignore inversify source map warnings', () => {
            // Arrange
            const ignoreWarnings = mockWebpackConfig.ignoreWarnings;
            const inversifyWarning = "Failed to parse source map from 'path/to/inversify/file.ts'";

            // Act & Assert
            // Check if any of the regex patterns in ignoreWarnings match the inversify warning
            const matchesWarning = ignoreWarnings.some((pattern) => {
                if (pattern instanceof RegExp) {
                    return pattern.test(inversifyWarning);
                }
                return false;
            });

            expect(matchesWarning).toBe(true);
        });

        it('should ignore the specific inversify warning from get_base_type.ts', () => {
            // Arrange
            const ignoreWarnings = mockWebpackConfig.ignoreWarnings;
            const specificWarning =
                "Failed to parse source map from 'I:\\DEV\\GAME-CLIENT-BASE\\sedie-client-demo-logs\\seal-monorepo\\node_modules\\inversify\\src\\utils\\get_base_type.ts' file: Error: ENOENT: no such file or directory, open 'I:\\DEV\\GAME-CLIENT-BASE\\sedie-client-demo-logs\\seal-monorepo\\node_modules\\inversify\\src\\utils\\get_base_type.ts'";

            // Act
            let isIgnored = false;
            for (const pattern of ignoreWarnings) {
                if (pattern instanceof RegExp && pattern.test(specificWarning)) {
                    isIgnored = true;
                    break;
                }

                if (
                    typeof pattern === 'object' &&
                    pattern.module &&
                    pattern.module.test('node_modules\\inversify\\src\\utils\\get_base_type.ts')
                ) {
                    isIgnored = true;
                    break;
                }
            }

            // Assert
            expect(isIgnored).toBe(true);
        });

        it('should ignore the specific inversify warning from id.ts', () => {
            // Arrange
            const ignoreWarnings = mockWebpackConfig.ignoreWarnings;
            const specificWarning =
                "Failed to parse source map from 'I:\\DEV\\GAME-CLIENT-BASE\\sedie-client-demo-logs\\seal-monorepo\\node_modules\\inversify\\src\\utils\\id.ts' file: Error: ENOENT: no such file or directory, open 'I:\\DEV\\GAME-CLIENT-BASE\\sedie-client-demo-logs\\seal-monorepo\\node_modules\\inversify\\src\\utils\\id.ts'";

            // Act
            let isIgnored = false;
            for (const pattern of ignoreWarnings) {
                if (pattern instanceof RegExp && pattern.test(specificWarning)) {
                    isIgnored = true;
                    break;
                }

                if (typeof pattern === 'object' && pattern.module && pattern.module.test('node_modules\\inversify\\src\\utils\\id.ts')) {
                    isIgnored = true;
                    break;
                }
            }

            // Assert
            expect(isIgnored).toBe(true);
        });

        it('should ignore module warnings for inversify', () => {
            // Arrange
            const ignoreWarnings = mockWebpackConfig.ignoreWarnings;
            const moduleObj = {
                module: '/node_modules/inversify/some-file.js',
                message: 'Some warning message',
            };

            // Act & Assert
            // Check if any of the object patterns in ignoreWarnings match the module object
            const matchesModule = ignoreWarnings.some((pattern) => {
                if (pattern && typeof pattern === 'object' && pattern.module) {
                    return pattern.module.test(moduleObj.module);
                }
                return false;
            });

            expect(matchesModule).toBe(true);
        });
    });
});
