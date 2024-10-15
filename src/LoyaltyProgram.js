import React, { useState } from 'react'
import { Web3 } from 'web3'
import './loyalty.css'

//2. import swisstronik plugin
import { SwisstronikPlugin } from '@swisstronik/web3-plugin-swisstronik'

//3. import ABI of counter contract
import ABI from './abi.mjs'

const LoyaltyProgram = () => {
  //4. initialize the web3 object
  const web3 = new Web3(window.ethereum)

  const [amount, setAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [transactionHash, setTransactionHash] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [account, setAccount] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [connectedAccount, setConnectedAccount] = useState(null)

  //5. register swisstronik plugin
  web3.registerPlugin(
    new SwisstronikPlugin('https://json-rpc.testnet.swisstronik.com')
  )

  //6. initialize contract
  const contract = new web3.eth.Contract(
    ABI,
    // '0x1F8d0A1f88C387931BDbb5EdADD876c6bE6055d723C6'
    '0xfbaBa387Af27F32066c8311d406F75E3cc3f'
  )

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        //Request account access
        const account = await web3.eth.requestAccounts()

        let chainID = await web3.eth.getChainId()
        // console.log('user sss :', chainID)

        if (Number(chainID) !== 1291) {
          alert('Please connect to the Swisstonik Testnet in your metamask')
        }

        setConnectedAccount(account[0])
        setErrorMessage('')
        console.log('connected account :', account[0])
      } catch (error) {
        console.error('Connection failed:', error)
        setErrorMessage('Connection failed: ' + error.message)
      }
    } else {
      setErrorMessage('Please install metamask')
    }
  }
  //   setErrorMessage('Connection failed: ' + error.message)

  const disconnectWallet = () => {
    setConnectedAccount(null)
    setIsDropdownOpen(false)
  }

  //7. call the contract

  async function returnCount() {
    console.log(await web3.eth.getChainId())

    const result = await contract.methods.returnCount().call()
    console.log('current count', result)
  }

  const handleReward = async () => {
    //Connect user's account
    const accounts = await web3.eth.requestAccounts()
    //You can check whether the connected account is among the issuers of the rewards
    //or not. Not for this challenge.

    const recepientAddress = recipientAddress
    if (recepientAddress.length !== 42) {
      alert('Invalid receipient address. Please check and try again.')
    }
    //get the money to send from the operator.
    const amount_to_receive = amount
    //convert it to wei amount
    const amount_to_receive_in_wei = web3.utils.toWei(
      amount_to_receive,
      'ether'
    )
    //convert amount to the wei unit
    // if (accounts[0] !== '0x4b6117d1fef269455ce59314c11b0b649da787ea') {
    //   alert(
    //     'Connected Account is not authorised to send rewards. Please try another wallet.'
    //   )
    // }
    const tx = await contract.methods
      .transfer(recepientAddress, amount_to_receive_in_wei)
      .send({ from: accounts[0] })
    setTransactionHash(tx.transactionHash)
    console.log('tx receipt:', tx)
  }
  async function increaseCount() {
    // connect user's account
    const accounts = await web3.eth.requestAccounts()

    // call the writing function "increaseCount"
    const receipt = await contract.methods
      .increaseCount()
      .send({ from: accounts[0] })
    console.log('tx receipt:', receipt)
  }

  return (
    <div className="loyalty-program-container">
      <h1>Loyalty Program</h1>
      <p>Rewarding all Participants in the Web3js Kampala challenge with SWB</p>

      <div className="connect-container">
        <button
          className={`connect-button ${connectedAccount ? 'connected' : ''}`}
          onClick={
            connectedAccount
              ? () => setIsDropdownOpen(!isDropdownOpen)
              : connectWallet
          }
        >
          {connectedAccount
            ? `Connected: ${connectedAccount.slice(
                0,
                6
              )}...${connectedAccount.slice(-4)}`
            : 'Connect Wallet'}
        </button>

        {isDropdownOpen && connectedAccount && (
          <div className="dropdown">
            <button className="dropdown-item" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Recipient Address:</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter recipient address"
          className="amount-input"
        />
      </div>
      <div className="form-group">
        <label>Reward Amount (in SWB):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter reward amount"
          className="amount-input"
        />
      </div>
      <button className="reward-button" onClick={handleReward}>
        Reward Participant.
      </button>
      {transactionHash && (
        <p className="success-message">Transaction Hash: {transactionHash}</p>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  )

  {
    /* <header className="App-header"> */
  }
  {
    /* <img src={logo} className="App-logo" alt="logo" /> */
  }
  {
    /* <button onClick={connectWallet}>Connect</button> */
  }
  {
    /* <button onClick={returnCount}>Count (reading fn)</button>
        <button onClick={increaseCount}>Increase Count (writing fn)</button> */
  }
  {
    /* </header> */
  }
}

export default LoyaltyProgram
