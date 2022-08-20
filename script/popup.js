const copyNotice = document.getElementById('copy-notice');
const copyUrl = document.getElementById('copy-url');
const copyParams = document.getElementById('copy-params');
const copyParamsArray = document.getElementById('copy-params-array');
const copySearch = document.getElementById('copy-search');
const baseInfo = document.getElementById('base-info');
const paramsInfo = document.getElementById('params-info');
const customBtn = document.getElementById('customBtn');
const customUrlView = document.getElementById('custom-url-view');
const urlTextarea = document.getElementById('custom-url-textarea');
const parseCustomBtn = document.getElementById('parse-custom-btn');

const noData = '<i class="no-data">void</i>';
const noDataAll = '<i class="no-data all">No Data</i>';
const defaultPort = {
    'http:': '80',
    'https:': '443',
    'fpt:': '21'
};
const baseKey = ['protocol', 'hostname', 'port', 'pathname', 'origin', 'hash'];
let timer = null;
let valDoms = null;
let currentTabUrl = '';
let customUrl = '';

const itemCopy = dom => copy(dom.currentTarget.textContent);

const copy = text => {
    if(typeof text === 'object') {
        text = JSON.stringify(text);
    }
    copyNotice.classList.remove('active');
    timer && clearTimeout(timer);
    let oInput = document.createElement("textarea");
    oInput.value = text;
    document.body.appendChild(oInput);
    oInput.select();
    document.execCommand('Copy');
    copyNotice.classList.add('active');
    timer = setTimeout(() => {
        copyNotice.classList.remove('active');
    }, 1000);
    oInput.remove();
}

const parseUrl = url => {
    const newUrl = new URL(url);
    const baseInfoStr = baseKey.reduce((prev, next) => {
        let val = newUrl[next];
        let classStr = '';
        if(!val && next === 'port') {
            val = defaultPort[newUrl.protocol];
        }
        if (!val) {
            val = noData;
            classStr = 'void'
        }
        prev += `<li class="item-container">
                    <label class="item-label">${next}</label>
                    <div class="item-value textarea ${classStr}" id="${next}">${val}</div>
                </li>`;
        return prev;
    }, '');

    baseInfoStr && (baseInfo.innerHTML = baseInfoStr);
    const { searchParams } = newUrl;
    const params = [...searchParams.entries()];
    const copyData = {};
    const paramsInfoStr = params.reduce((prev, next) => {
        copyData[next[0]] = next[1];
        let val = decodeURIComponent(next[1]);
        let classStr = '';
        if (!val) {
            val = noData;
            classStr = 'void'
        }
        prev += `<li class="item-container">
                    <label class="item-label">${next[0]}</label>
                    <div class="item-value textarea ${classStr}" id="${next[0]}">${val}</div>
                </li>`;
        return prev;
    }, '')
    paramsInfoStr && (paramsInfo.innerHTML = paramsInfoStr);

    valDoms = Array.from(document.getElementsByClassName('item-value')).filter(e => !Array.from(e.classList).includes('void'));
    valDoms.forEach(ele => ele.onclick = itemCopy);

    copyUrl.onclick = () => copy(newUrl.href);
    copyParams.onclick = () => copy(copyData);
    copySearch.onclick = () => copy(newUrl.search);
    copyParamsArray.onclick = () => copy(params);
};


const resetPanel = () => {
    copyUrl.onclick = null;
    copyParams.onclick = null;
    copySearch.onclick = null;
    copyParamsArray.onclick = null;
    valDoms.forEach(ele => ele.onclick = null);
    paramsInfo.innerHTML = noDataAll;
    baseInfo.innerHTML = noDataAll;
};

customBtn.onclick = e => {
    resetPanel();
    if(e.target.checked) {
        customUrlView.classList.add('block');
        if(customUrl) {
            urlTextarea.value = customUrl;
            parseUrl(customUrl);
        }
    } else {
        customUrlView.classList.remove('block');
        parseUrl(currentTabUrl);
    }
};

parseCustomBtn.onclick = () => {
    const _customUrl = urlTextarea.value;
    if(_customUrl) {
        resetPanel();
        customUrl = _customUrl;
        parseUrl(_customUrl);
    };
};

chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
    let tab = tabs[0];
    currentTabUrl = tab.url;
    parseUrl(tab.url);
});
