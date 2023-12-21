import { md5 } from "js-md5"

export default function uuidOffline(username) {
    let str = "OfflinePlayer:" + username;

    let hash = md5(str);
    let byte_arr = []
    for (let i = 0; i < hash.length; i += 2)
        byte_arr.push(parseInt(hash.substring(i, i + 2), 16));
    byte_arr[6] = byte_arr[6] & 0x0f | 0x30;
    byte_arr[8] = byte_arr[8] & 0x3f | 0x80;
    str = "";
    byte_arr.forEach((byte) => {
        str += ((byte >>> 4).toString(16));
        str += ((byte & 0xF).toString(16));
    });
    return str;
};