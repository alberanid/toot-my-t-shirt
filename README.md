# toot-my-t-shirt

A work-in-progress project for 35C3 (from an idea by itec)

Still not much to see here: the UI still sucks and very little feedback is given to the user.

# Requirements

* Python 3
* Mastodon.py: https://github.com/halcy/Mastodon.py

# Run

```
./toot-my-t-shirt --debug --mastodon-token=C0FEFE --mastodon-api-url=https://botsin.space/ --default-image-description="a nice description of the picture" --default-message="oh noes, another selfie" --store-dir="/tmp/selfies"
```

## Run using Docker

### Build it

```
docker build -t toot-my-t-shirt .
```

### Run it

```
docker run --rm -it -p 9000:9000 toot-my-t-shirt [whatever other options you need]
```

## Notice about SSL

Some browsers require HTTPS, to allow access to the webcam.  In the *ssl/* directory there is a self-signed certificate (completed with CA) to allow you to test it without the need to create your own.  In production you are supposed to use your own certificate.


# License and copyright

Copyright 2018-2019 Davide Alberani <da@mimante.net>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

