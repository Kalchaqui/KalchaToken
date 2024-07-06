import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useForm } from 'react-hook-form';

const { ethereum } = window as any;

type LoginFormInputs = {
    address: string;
    amount: string;
}

export function Balance() {
    const { register, handleSubmit } = useForm<LoginFormInputs>();
    const [cuenta, setCuenta] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [txSuccess, setTxSuccess] = useState<string | null>(null);
    const [txError, setTxError] = useState<string | null>(null);

    useEffect(() => {
        if (ethereum) {
            ethereum.request({ method: "eth_requestAccounts" })
                .then((cuentas: string[]) => {
                    setCuenta(cuentas[0])
                    ethereum.on('accountsChanged', (nuevasCuentas: string[]) => {
                        setCuenta(nuevasCuentas[0]);
                    });
                })
                .catch((error: any) => {
                    console.error(error);
                });
        }
    }, []);

    useEffect(() => {
        if (cuenta) {
            const provider = new ethers.BrowserProvider(ethereum)
            provider.getBalance(cuenta).then(balance => {
                setBalance(ethers.formatEther(balance));
            })
        }
    }, [cuenta]);

    async function submit(data: LoginFormInputs) {
        setTxSuccess(null);
        setTxError(null);

        const transactionParameters = {
            from: cuenta,
            to: data.address,
            value: ethers.parseEther(data.amount).toString()
        };
        try {
            const txHash = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            setTxSuccess(txHash)
        } catch (error: any) {
            setTxError(error.message);
        }
    };

    if (!ethereum) {
        return <div>No hay conexión con MetaMask</div>
    }

    return (
        <div>
            Cuenta:
            <p>{
                cuenta ? cuenta : 'Cargando...'
            }
            </p>
            Balance:
            <p>
                {
                    balance ? balance : 'Cargando...'
                }
            </p>

            <form className='form-inline' onSubmit={handleSubmit(submit)}>
                <div className='form-group mb-3'>
                    <label htmlFor="address">Adreess</label>
                    <input defaultValue='0xb0F51054Ba8eF3ae33fB7212AaccB0e89990C3dD' id="address" className='form-control' {...register('address')} />
                </div>
                <div className='form-group mb-3'>
                    <label htmlFor="amount">Amount</label>
                    <input defaultValue={0.0005} id="amount" className='form-control' {...register('amount')} />
                </div>
                <button type="submit" className='btn btn-primary'>Send</button>
            </form>

            {txSuccess && <div className='alert alert-info mt-3'>{txSuccess}</div>}
            {txError && <div className='alert alert-danger mt-3'>{txError}</div>}
        </div>
    )
}