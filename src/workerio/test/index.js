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

import TestPlatformObject from './test-platform-object';
import TestPlatformEvented from './test-platform-evented';
import TestPlatformDeferred from './test-platform-deferred';
import TestBuilder from './test-builder';
import TestConnection from './test-connection';
import TestIntegration from './test-integration';



TestPlatformObject();
TestPlatformEvented();
TestPlatformDeferred();
TestBuilder();
TestConnection();
TestIntegration();
