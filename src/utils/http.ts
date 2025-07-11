import ky from 'ky';
import { GistConfig } from './setting';

export function getHttpInstance(config: GistConfig, provider: 'github' | 'gitee') {
    let prefixUrl = '';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json;charset=utf-8',
        'cache': 'no-store',
    };

    if (provider === 'github') {
        prefixUrl = 'https://api.github.com';
        headers['Authorization'] = `Bearer ${config.token}`;
        headers['X-GitHub-Api-Version'] = '2022-11-28';
        headers['Accept'] = 'application/vnd.github+json';
    } else if (provider === 'gitee') {
        prefixUrl = 'https://gitee.com/api/v5';
        headers['Authorization'] = `token ${config.token}`;
        headers['Accept'] = 'application/json';
    }

    return ky.create({
        prefixUrl,
        timeout: 60000,
        retry: 1,
        headers,
    });
}