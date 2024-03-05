import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { useMagic } from '../MagicProvider';
import FormButton from '@/components/ui/FormButton';
import FormInput from '@/components/ui/FormInput';
import ErrorText from '@/components/ui/ErrorText';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import { getFaucetUrl, getNetworkToken } from '@/utils/network';
import showToast from '@/utils/showToast';
import Spacer from '@/components/ui/Spacer';
import TransactionHistory from '@/components/ui/TransactionHistory';
import Image from 'next/image';
import Link from 'public/link.svg';
import { isAddress, parseEther } from 'viem';
import { sepolia } from 'viem/chains';

const SendTransaction = () => {
  const { walletClient, publicClient } = useMagic();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [hash, setHash] = useState('');
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const publicAddress = localStorage.getItem('user');

  useEffect(() => {
    setDisabled(!toAddress || !amount);
    setAmountError(false);
    setToAddressError(false);
  }, [amount, toAddress]);

  const sendTransaction = useCallback(async () => {
    if (!isAddress(toAddress)) {
      return setToAddressError(true);
    }
    if (isNaN(Number(amount))) {
      return setAmountError(true);
    }
    setDisabled(true);
    const hash = await walletClient?.sendTransaction({
      chain: sepolia,
      account: publicAddress as `0x${string}`,
      to: toAddress,
      value: parseEther(amount),
    });
    if (hash) {
      setHash(hash)
      setToAddress('');
      setAmount('');
      console.log('Transaction hash:', hash);
      showToast({
        message: 'Transaction Successful.',
        type: 'success',
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash })
      console.log('Transaction receipt:', receipt);
    }
    setDisabled(false);
  }, [walletClient, publicClient, publicAddress, amount, toAddress]);

  return (
    <Card>
      <CardHeader id="send-transaction">Send Magic Transaction</CardHeader>
      {getFaucetUrl() && (
        <div>
          <a href={getFaucetUrl()} target="_blank" rel="noreferrer">
            <FormButton onClick={() => null} disabled={false}>
            Get Test {getNetworkToken()}
              <Image src={Link} alt="link-icon" className="ml-[3px]" />
            </FormButton>
          </a>
          <Divider />
        </div>
      )}
      <FormInput
        value={toAddress}
        onChange={(e: any) => setToAddress(e.target.value)}
        placeholder="Receiving Address"
      />
      {toAddressError ? <ErrorText>Invalid address</ErrorText> : null}
      <FormInput
        value={amount}
        onChange={(e: any) => setAmount(e.target.value)}
        placeholder={`Amount (${getNetworkToken()})`}
      />
      {amountError ? <ErrorText className="error">Invalid amount</ErrorText> : null}
      <FormButton onClick={sendTransaction} disabled={!toAddress || !amount || disabled}>
        Send Transaction
      </FormButton>
      {hash ? (
        <>
          <Spacer size={20} />
          <TransactionHistory hash={hash}/>
        </>
      ) : null}
    </Card>
  );
};

export default SendTransaction;
