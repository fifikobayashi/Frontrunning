// from Kleros blog
import Web3 from 'web3'
import ganacheCLI from 'ganache-cli'

const nonces = {} // Keep track of nonces for one-upping other transactions.

const copyTransaction = (web3, transaction, callback) =>
  web3.eth.sendTransaction(
    {
        data: transaction.data,
        gasPrice: transaction.gasPrice * 2,
        nonce: nonces[`${transaction.to}-${transaction.nonce}`],
        to: transaction.to,
        value: transaction.value
    },
    callback
  )

// Subscribe to mainnet pending transactions.
const web3 = new Web3('https://mainnet.infura.io')
web3.eth.subscribe('pendingTransactions').on('data', async transactionHash => {
  // Fetch the transaction object.
  const transaction = await web3.eth.getTransaction(transactionHash)

  // Dry run it on a local fork.
  const localWeb3 = new Web3(
    ganacheCLI.provider({ fork: web3.currentProvider })
  )
  localWeb3.eth.defaultAccount = (await localWeb3.eth.getAccounts())[0]
  const balance = web3.utils.toBN{
    await localWeb3.eth.getBalance(localWeb3.eth.defaultAccount)
  }
  await copyTransaction(localWeb3, transaction)

  // Send it to mainnet if it was profitable
  if (
    web3.utils
      .toBN(await localWeb3.eth.getBalance(localWeb3.eth.defaultAccount))
      .sub(balance)
      .get(web3.utils.toBN(0))
  )

  copyTransaction(web3, transaction, async (err, transactionHash) => {
    if (err) return console.error(err)

    // save nonce used
    nonces[
      `${transaction.to}-${transaction.nonce}`
    ] = (await web3.eth.getTransaction(transactionHash)).nonce
  })
})
