/* global QUnit, require */

(function () {

    // Configure RequireJS so it resolves relative module paths from the `src`
    // folder.
    require.config({
        baseUrl: "/dist"
    });

    // A list of all QUnit test Modules.  Make sure you include the `.js`
    // extension so RequireJS resolves them as relative paths rather than using
    // the `baseUrl` value supplied above.
    var testModules = [
        "/tests/test_platform_object.js",
        "/tests/test_platform_evented.js",
        "/tests/test_builder.js",
        "/tests/test_connection.js",
        "/tests/test_integration.js",
    ];

    // Resolve all testModules and then start the Test Runner.
    require(testModules, function () {

        QUnit.log(function (details) {
            if (!details.result) {

                var message = "Error in test: '${module}/${name}' "
                    .replace('${module}', details.module)
                    .replace('${name}', details.name);

                if (details.message instanceof Error) {
                    console.error(
                        message,
                        details.message.message, details.message.stack
                    );
                }

                else if (details.source) {
                    console.error(message, details.source);
                }


            }
        });

        QUnit.load();
        QUnit.start();
    });
}());