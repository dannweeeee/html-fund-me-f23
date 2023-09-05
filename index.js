import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect // calls the connect function
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
  if (typeof window.ethereum !== "undefined") { // check to see if window.ethereum (metamask) exists
    try {
      await ethereum.request({ method: "eth_requestAccounts" }) // function that metamask object has that allows the website to see if there are accounts that it can send transactions to
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected"
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value // gets the eth amount from the input field
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") { // check to see if window.ethereum (metamask) exists
    const provider = new ethers.providers.Web3Provider(window.ethereum) // gets the rpc url from inside our metamask --> use ethers
    const signer = provider.getSigner() // allows us to grab this account form that is connected 
    const contract = new ethers.Contract(contractAddress, abi, signer) // need a contract address, abi and a signer
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount), // o.1eth --> 100000000000000000 
      }) // what this function does is it sends this transaction to our metamask, so the website never accesses our private key
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") { // check to see if window.ethereum (metamask) exists
    const provider = new ethers.providers.Web3Provider(window.ethereum) // ethers is a javascript package that makes it easy to interact and work with metamask
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.utils.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations. `
      )
      resolve()
    })
  })
}
