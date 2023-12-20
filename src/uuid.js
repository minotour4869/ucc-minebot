import { md5 } from "js-md5"

export default function uuidOffline(username) {
    const str = "OfflinePlayer:" + username;

    const textEncoder = new TextEncoder();

    String.prototype.replaceAt = function (index, replacement) {
        return this.substring(0, index) + replacement + this.substring(index + replacement.length);
    }

    let hash = md5(textEncoder.encode(str))
    return hash.replaceAt(6, (hash[6] & 0x0f | 0x30)).replaceAt(8, (hash[8] & 0x3f | 0x80));
};