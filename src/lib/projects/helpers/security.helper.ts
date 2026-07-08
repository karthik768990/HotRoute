function isLocalHost(url: URL): boolean {
    return (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '::1' || url.hostname === '[::1]'
    )

}

function isPrivateIp(hostname: string): boolean {
    const octets = hostname.split(".");

    if (octets.length !== 4) {
        return false;
    }

    const firstOctet = Number(octets[0]);
    const secondOctet = Number(octets[1]);

    // 10.0.0.0/8
    if (firstOctet === 10) {
        return true;
    }

    // 172.16.0.0 - 172.31.255.255
    if (
        firstOctet === 172 &&
        secondOctet >= 16 &&
        secondOctet <= 31
    ) {
        return true;
    }

    // 192.168.0.0/16
    if (
        firstOctet === 192 &&
        secondOctet === 168
    ) {
        return true;
    }

    return false;
}

function isMetadataEndpoint(hostname: string): boolean {
    return hostname === "169.254.169.254";
}


export {isMetadataEndpoint,isPrivateIp,isLocalHost}