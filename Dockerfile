FROM alpine
LABEL \
	maintainer="Davide Alberani <da@erlug.linux.it>"

RUN \
	apk add --no-cache \
		python3 \
		py3-tornado \
		py3-cffi \
		py3-six \
		py3-requests \
		py3-tz \
		py3-dateutil \
		py3-decorator \
		py3-cryptography && \
	pip3 install Mastodon.py

COPY ssl /ssl
COPY static /static
COPY toot-my-t-shirt /
WORKDIR /

EXPOSE 80

ENTRYPOINT ["python3", "toot-my-t-shirt"]
