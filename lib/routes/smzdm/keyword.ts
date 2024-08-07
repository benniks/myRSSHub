import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/keyword/:keyword',
    categories: ['shopping', 'popular'],
    view: ViewType.Notifications,
    example: '/smzdm/keyword/女装',
    parameters: { keyword: '你想订阅的关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '关键词',
    maintainers: ['DIYgod', 'MeanZhang'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');

    const response = await got(`https://search.smzdm.com`, {
        headers: {
            Referer: `https://search.smzdm.com/?c=home&s=${encodeURIComponent(keyword)}&order=time&v=a`,
        },
        searchParams: {
            c: 'home',
            s: keyword,
            order: 'time',
            v: 'a',
            mx_v: 'a',
        },
    });

    const data = response.data;

    const $ = load(data);
    const list = $('.feed-row-wide');

    return {
        title: `${keyword} - 什么值得买`,
        link: `https://search.smzdm.com/?c=home&s=${encodeURIComponent(keyword)}&order=time`,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                return {
                    title: `${item.find('.feed-block-title a').eq(0).text().trim()} - ${item.find('.feed-block-title a').eq(1).text().trim()}`,
                    description: `${item.find('.feed-block-descripe').contents().eq(2).text().trim()}<br>${item.find('.feed-block-extras span').text().trim()}<br><img src="http:${item.find('.z-feed-img img').attr('src')}">`,
                    pubDate: timezone(parseDate(item.find('.feed-block-extras').contents().eq(0).text().trim(), ['MM-DD HH:mm', 'HH:mm']), +8),
                    link: item.find('.feed-block-title a').attr('href'),
                };
            }),
    };
}
