import React from 'react';
import WalletMethods from './cards/WalletMethodsCard';
import SendAaTransaction from './cards/SendAaTransactionCard';
import SendEoaTransaction from './cards/SendEoaTransactionCard';
import Spacer from '@/components/ui/Spacer';
import { LoginProps } from '@/utils/types';
import UserInfo from './cards/UserInfoCard';
import DevLinks from './DevLinks';
import Header from './Header';

export default function Dashboard({ token, setToken }: LoginProps) {
  return (
    <div className="home-page">
      <Header />
      <div className="cards-container">
        <UserInfo token={token} setToken={setToken} />
        <Spacer size={10} />
        <SendEoaTransaction />
        <Spacer size={10} />
        <SendAaTransaction />
        <Spacer size={10} />
        <WalletMethods token={token} setToken={setToken} />
        <Spacer size={15} />
      </div>
      <DevLinks primary />
    </div>
  );
}
