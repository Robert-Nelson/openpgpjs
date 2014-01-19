#!/bin/bash
if [ "${TRAVIS_BRANCH}" == "master" -o true ]; then
    echo TRAVIS_BRANCH=${TRAVIS_BRANCH}
    echo TRAVIS_COMMIT=${TRAVIS_COMMIT}
    git tag --force -m "Latest tested version" LatestDev "${TRAVIS_COMMIT}"
    node travis/make-release.js
fi
