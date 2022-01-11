const serverUrl = "https://5bwvp3d8yg7d.usemoralis.com:2053/server";
const appId = "XS2CIHV2ND62MBykRlXZ4Ep6Dwy7xPXXh0MUJmch";

Moralis.start({serverUrl, appId})

let homepage = "http://127.0.0.1:5500/signin.html"
if (Moralis.User.current() == null && window.location.href != homepage){
    document.querySelector('body').style.display = 'none';
    window.location.href = 'signin.html'
}

login = async () => {
    await Moralis.authenticate().then(async function (user) {
        console.log("logged in");
        user.set("Name", document.getElementById("user-username").value);
        user.set("email", document.getElementById("user-email").value);
        await user.save();
        window.location.href = "dashboard.html";
    })
}

logout = async () => {
    await Moralis.User.logOut();
    window.location.href = "signin.html"
}

getTransactions = async () => {
    const options = {chain:"rinkeby", address:"0x0d12c803bd27Fe36768002041972d2914A6f800C"}
    const transactions = await Moralis.Web3API.account.getTransactions(options)
    console.log(transactions)

    if (transactions.total > 0){
        let table = `
        <table class = "table">
        <thead>
            <tr>
            <th scope="col">Transaction</th>
            <th scope="col">Block Number</th>
            <th scope="col">Age</th>
            <th scope="col">Type</th>
            <th scope="col">Fee</th>
            <th scope="col">Value</th>
            </tr>
        </thead>
        <tbody id="theTransactions">

        </tbody>
        </table>
        `

        document.getElementById("tableOfTransactions").innerHTML = table;

        transactions.result.forEach(t => {
            let content = `
            <tr>
                <td><a href="https://rinkeby.etherscan.io/tx/${t.hash}" target="_blank" rel="noopener noreferrer">${t.hash}</a></th>
                <td><a href="https://rinkeby.etherscan.io/block/${t.block_number}" target="_blank" rel="noopener noreferrer">${t.block_number}</a></th>
                <td>${millisecToTime(Date.parse(new Date()) - Date.parse(t.block_timestamp))}</th>
                <td>${t.from_address == Moralis.User.current().get('ethAddress')?'Outgoing':'Incoming'}</th>
                <td>${((t.gas_price * t.gas)/1e18).toFixed(5)}</th>
                <td>${(t.value / 1e18).toFixed(5)} ETH</th>
            </tr>
            `
            document.getElementById("theTransactions").innerHTML += content
        })
    }
}

getBalances = async () => {
    const RopstenBalance = await Moralis.Web3API.account.getNativeBalance({chain:"ropsten"})
    const RinkebyBalance = await Moralis.Web3API.account.getNativeBalance({chain:"rinkeby"})
    const EtherBalance = await Moralis.Web3API.account.getNativeBalance()

    console.log("Ropsten : "+(RopstenBalance.balance/1e18).toFixed(5)+" ETH")
    console.log("Rinkeby : "+(RinkebyBalance.balance/1e18).toFixed(5)+" ETH")
    console.log("Ether : "+(EtherBalance.balance/1e18).toFixed(5)+" ETH")

    let content = document.querySelector('#userBalances').innerHTML = `
    <table class="table">
        <thead>
            <tr>
                <th scope="col">Chain</th>
                <th scope="col">Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>Ether</th>
                <td>${(EtherBalance.balance / 1e18).toFixed(5)}</td>
            </tr>
            <tr>
                <th>Rinkeby</th>
                <td>${(RinkebyBalance.balance / 1e18).toFixed(5)}</td>
            </tr>
            <tr>
                <th>Ropsten</th>
                <td>${(RopstenBalance.balance / 1e18).toFixed(5)}</td>
            </tr>
        </tbody>
    </table>
    `

}


millisecToTime = (ms) => {
    let min = Math.floor(ms / (1000*60))
    let hr = Math.floor(ms / (1000*60*60))
    let days = Math.floor(ms / (1000*60*60*24))

    if (days<1){
        if (hr<1){
            if(min<1){
                return `less than a minute ago`
            }else return `${min} minutes ago`
        }else return `${hr} hours ago`
    }else return `${days} days ago`
}

if (document.querySelector("#btn-login") != null)
{
    document.querySelector("#btn-login").onclick = login
}
if (document.querySelector("#btn-logout") != null) 
{
    document.querySelector("#btn-logout").onclick = logout
}
if (document.querySelector("#get-transactions-link") != null) 
{
    document.querySelector("#get-transactions-link").onclick = getTransactions
}
if (document.querySelector("#get-balances-link") != null) 
{
    document.querySelector("#get-balances-link").onclick = getBalances
}


