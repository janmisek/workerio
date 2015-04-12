/* global QUnit, console */

QUnit.log(function (details) {
    if (!details.result && console) {

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

import TestPlatformObject from './test_platform_object';
import TestPlatformEvented from './test_platform_evented';
import TestBuilder from './test_builder';
import TestConnection from './test_connection';
import TestIntegration from './test_integration';



TestPlatformObject();
TestPlatformEvented();
TestBuilder();
TestConnection();
TestIntegration();
