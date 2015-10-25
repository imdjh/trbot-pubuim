FROM node:0.12
MAINTAINER Jiahao Dai <dyejarhoo@gmail.com>

RUN git clone https://github.com/imdjh/trbot-pubuim /srv/trbot-pubuim && \
        cd /srv/trbot-pubuim && \
        npm install && \
        npm install forever -g

EXPOSE 8079

CMD ["forever", "/srv/trbot-pubuim/index.js"]
