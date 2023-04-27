FROM ghcr.io/puppeteer/puppeteer

USER 0
RUN corepack enable && corepack prepare pnpm@latest --activate
USER 1000

WORKDIR /code
COPY package.json pnpm-lock.yaml /code/
RUN pnpm i
COPY . /code

# 新建.env文件并写入两行数据
RUN 
RUN touch /code/.env
RUN echo "BASE_URL="https://ai.devtool.tech/proxy"" >> /code/.env
RUN echo "OPEN_API_KEY="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"" >> /code/.env
RUN echo "WECHATY_PUPPET="wechaty-puppet-wechat"" >> /code/.env

CMD npm start
