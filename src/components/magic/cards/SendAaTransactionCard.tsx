import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
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
import { useAlchemyProvider } from '@/components/alchemy/useAlchemyProvider';

const SendTransaction = () => {
  const { smartClient } = useAlchemyProvider();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [hash, setHash] = useState<any>('');
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);

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
    const result = await smartClient?.sendUserOperation({
      uo: {
        target: toAddress,
        data: '0x',
        value: parseEther(amount),
      }, 
      account: smartClient.account!,
    })
    if (result?.hash) {
      setToAddress('');
      setAmount('');
      console.log('Transaction hash:', result.hash);
      showToast({
        message: 'Transaction Successful. Wait for UserOp receipt.',
        type: 'success',
      });
      const receipt = await smartClient?.waitForUserOperationTransaction({ hash: result.hash });
      setHash(receipt);
      console.log('UserOp Transaction receipt:', receipt);
    }
    setDisabled(false);
  }, [smartClient, amount, toAddress]);

  return (
    <Card>
      <CardHeader id="send-transaction">Send AA Transaction</CardHeader>
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
