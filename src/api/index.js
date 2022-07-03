import request from '../utils/request';

export const fetchData = query => {
    return request({
        url: './table.json',
        method: 'get',
        params: query
    });
};

export const fetchDebugVideoFrame=query=>{

    return request({
        url: '/video/videoFrame',
        method: 'POST',
        params: query
    });
}


