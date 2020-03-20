let db ;

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const request = indexedDB.open('budgetdb', 1);

request.onupgradeneeded = ({target}) =>{
    let db = target.result;
    db.createObjectStore('offlineTransaction', {autoIncrement:true})
}

request.onsuccess = ({target})=>{
    db = target.result;
    console.log('DB IS LOADED!');
    window.navigator.onLine ? submitTrans() : '';
}

function saveRecord (data) {
    const transaction = db.transaction(['offlineTransaction'], 'readwrite');
    const store = transaction.objectStore('offlineTransaction');
    store.add(data);
}

function submitTrans () {
    const transaction = db.transaction(['offlineTransaction'], 'readwrite');
    const store = transaction.objectStore('offlineTransaction');
    const getAll = store.getAll();
    getAll.onsuccess = function () {
        if(getAll.result.length){
            fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          }).then(res=>{
              return res.json()
          }).then(()=>{
            const transaction = db.transaction(['offlineTransaction'], 'readwrite');
            const store = transaction.objectStore('offlineTransaction');
              console.log('OFFLINE TRANS UPLOADED!')
              store.clear()
          })
        }
        
    }
}