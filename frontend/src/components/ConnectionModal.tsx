import { Button, Dialog, TextInput, Dropdown, Banner } from '@neo4j-ndl/react';
import { useState } from 'react';
import connectAPI from '../services/ConnectAPI';
import { useCredentials } from '../context/UserCredentials';
import { ConnectionModalProps } from '../types';
import { initialiseDriver } from '../utils/Driver';
import { Driver } from 'neo4j-driver';

const ConnectionModal: React.FunctionComponent<ConnectionModalProps> = ({
  open,
  setOpenConnection,
  setConnectionStatus,
}) => {
  const protocols = ['neo4j', 'neo4j+s', 'neo4j+ssc', 'bolt', 'bolt+s', 'bolt+ssc'];
  const [selectedProtocol, setSelectedProtocol] = useState<string>(
    localStorage.getItem('selectedProtocol') ?? 'neo4j+s'
  );
  const [hostname, setHostname] = useState<string>(localStorage.getItem('hostname') ?? '');
  const [database, setDatabase] = useState<string>(localStorage.getItem('database') ?? 'neo4j');
  const [username, setUsername] = useState<string>(localStorage.getItem('username') ?? 'neo4j');
  const [password, setPassword] = useState<string>('');
  const { setUserCredentials,setDriver } = useCredentials();
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [status, setStatus] = useState<'unknown' | 'success' | 'info' | 'warning' | 'danger'>('unknown');
  const [loading, setLoading] = useState<boolean>(false);
  const [port, setPort] = useState<string>(localStorage.getItem('port') ?? '7687');

  const submitConnection = async () => {
    const connectionURI = `${selectedProtocol}://${hostname}:${port}`;
    setUserCredentials({ uri: connectionURI, userName: username, password: password, database: database });
    localStorage.setItem('username', username);
    localStorage.setItem('hostname', hostname);
    localStorage.setItem('database', database);
    localStorage.setItem('selectedProtocol', selectedProtocol);
    setLoading(true);
    const response = await connectAPI(connectionURI, username, password, database);
    if (response.data.status === 'Success') {
      setOpenConnection(false);
      setConnectionStatus(true);
      setStatusMessage(response.data.message);
      driverSetting(connectionURI, username, password);
    } else {
      setStatus('danger');
      setStatusMessage(response.data.error);
      setConnectionStatus(false);
      setPassword('');
      setTimeout(() => {
        setStatus('unknown');
      }, 5000);
    }
    setLoading(false);
  };

  const driverSetting = (connectionURI:string, username:string, password:string) => {
    initialiseDriver(connectionURI, username, password).then((driver: Driver) => {
      if (driver) {
        setConnectionStatus(true);
        setDriver(driver)
      }
      else {
        setConnectionStatus(false);
      }
    })
  }

  const isDisabled = !username || !hostname || !password;
  return (
    <>
      <Dialog size='small' open={open} aria-labelledby='form-dialog-title' disableCloseButton>
        <Dialog.Header id='form-dialog-title'>Connect to Neo4j</Dialog.Header>
        <Dialog.Content className='n-flex n-flex-col n-gap-token-4'>
          {status !== 'unknown' && (
            <Banner
              name='connection banner'
              closeable
              description={statusMessage}
              onClose={() => setStatus('unknown')}
              type={status}
            />
          )}
          <div className='n-flex n-flex-row n-flex-wrap'>
            <Dropdown
              id='protocol'
              label='Protocol'
              type='select'
              disabled={false}
              selectProps={{
                onChange: (newValue) => newValue && setSelectedProtocol(newValue.value),
                options: protocols.map((option) => ({ label: option, value: option })),
                value: { label: selectedProtocol, value: selectedProtocol },
              }}
              className='connectionmodal__protocal__input'
              fluid
            />
            <div className='connectionmodal__hostname__input'>
              <TextInput
                id='url'
                value={hostname}
                disabled={false}
                label='Connection URL'
                autoFocus
                fluid
                onChange={(e) => setHostname(e.target.value)}
                aria-label='Connection url'
              />
            </div>
            <div className='connectionmodal__port__input'>
              <TextInput
                id='port'
                value={port}
                disabled={false}
                label='Port'
                aria-label='Port'
                placeholder='7687'
                fluid
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
          </div>
          <TextInput
            id='database'
            value={database}
            disabled={false}
            label='Database'
            aria-label='Database'
            placeholder='neo4j'
            fluid
            required
            onChange={(e) => setDatabase(e.target.value)}
          />
          <div className='n-flex n-flex-row n-flex-wrap'>
            <div className='connectionmodal__input'>
              <TextInput
                id='username'
                value={username}
                disabled={false}
                label='Username'
                aria-label='Username'
                placeholder='neo4j'
                fluid
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className='connectionmodal__input'>
              <TextInput
                id='password'
                value={password}
                disabled={false}
                label='Password'
                aria-label='Password'
                type='password'
                fluid
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <Dialog.Actions className='mt-6 mb-2'>
            <Button
              color='neutral'
              fill='outlined'
              onClick={() => {
                setOpenConnection(false);
              }}
            >
              Cancel
            </Button>
            <Button loading={loading} disabled={isDisabled} onClick={() => submitConnection()}>
              Submit
            </Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </>
  );
};
export default ConnectionModal;
