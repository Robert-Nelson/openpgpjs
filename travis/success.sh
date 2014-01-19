#!/bin/sh
if [ "${TRAVIS_BRANCH}" == "master" -o true ]; then
    git tag --force -m "Latest tested version" LatestDev "${TRAVIS_COMMIT}"
    travis/make-release
fi
