console.log("Script is running");

function convertMaps() {
    let iframes = document.querySelectorAll('iframe');
    iframes.forEach(function (iframe) {
        let src = iframe.getAttribute('src') || iframe.getAttribute('data-src');
        console.log('Checking iframe src:', src);
        if (src && src.includes('google.com/maps')) {
            processIframe(iframe, src);
        }
    });
}

function processIframe(iframe, src) {
    let lat, lng, address;

    let centerMatch = src.match(/center=([\d.-]+),([\d.-]+)/);
    if (centerMatch && centerMatch.length === 3) {
        lat = parseFloat(centerMatch[1]);
        lng = parseFloat(centerMatch[2]);
    } else {
        let latMatch = src.match(/!3d([\d.-]+)/);
        let lngMatch = src.match(/!2d([\d.-]+)/);
        if (latMatch && latMatch.length === 2 && lngMatch && lngMatch.length === 2) {
            lat = parseFloat(latMatch[1]);
            lng = parseFloat(lngMatch[1]);
        }
    }

    if (lat !== undefined && lng !== undefined) {
        let newIframe = replaceMap(lat, lng, null);
        iframe.parentNode.replaceChild(newIframe, iframe);
    } else {
        let addressMatch = src.match(/[&?]q=([^&]+)/);
        if (addressMatch && addressMatch.length === 2) {
            address = decodeURIComponent(addressMatch[1]).replace(/\+/g, ' ');
            let newIframe = replaceMap(null, null, address);
            iframe.parentNode.replaceChild(newIframe, iframe);
        }
    }
}

function replaceMap(lat, lng, address) {
    let headerElement = document.querySelector('header');
    let headerColor = getComputedStyle(headerElement).backgroundColor;
    let hexColor = rgbToHex(headerColor);

    let faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    let faviconURL = faviconLink ? faviconLink.href : '';

    let stay22URL;
    if (address) {
        stay22URL = `https://www.stay22.com/embed/gm?aid=vermontcom&showgmapsicon=trueaddress=${address}`;
    } else {
        stay22URL = `https://www.stay22.com/embed/gm?aid=vermontcom&showgmapsicon=truelat=${lat}&lng=${lng}`;
    }

    stay22URL += `&maincolor=${hexColor}&markerimage=${faviconURL}`;

    console.log('Replacing with Stay22 URL:', stay22URL);

    let newIframe = document.createElement('iframe');
    newIframe.src = stay22URL;
    newIframe.width = "100%";
    newIframe.height = "460";
    newIframe.frameBorder = "0";
    newIframe.id = "stay22-widget";
    
    return newIframe;
}

function rgbToHex(rgb) {
    let regex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
    let result = rgb.match(regex);
    return result ? `#${(+result[1]).toString(16).padStart(2, '0')}${(+result[2]).toString(16).padStart(2, '0')}${(+result[3]).toString(16).padStart(2, '0')}` : '';
}

const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'childList') {
            convertMaps();
        }
    }
});

const config = {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true
};

observer.observe(document.body, config);

convertMaps();
