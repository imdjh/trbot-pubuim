FROM node:0.12
MAINTAINER Jiahao Dai <dyejarhoo@gmail.com>

RUN git clone https://github.com/imdjh/nommander /srv/nommander && \
        cd /srv/nommander && \
        npm install && \
        npm install forever -g

EXPOSE 8079

CMD ["forever", "/srv/nommander/index.js"]
