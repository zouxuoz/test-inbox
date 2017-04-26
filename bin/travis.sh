#!/bin/bash

result=0

npm run lint; if [ "$?" != "0" ]; then result=1; fi
npm run e2e; if [ "$?" != "0" ]; then result=1; fi

exit $result