import React, { useState } from 'react';
import { Formik, Form, FormikHelpers, FormikValues } from 'formik';
import * as Yup from 'yup';
import Turnstile from 'react-turnstile';
import CustomButton from '../custom-button/custom-button';
import { toast } from 'react-toastify';
import androidIcon from '../../assets/images/android-icon.png';
import { Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface AppFormProps<T extends FormikValues> {
    initialValues: T;
    validationSchema: Yup.ObjectSchema<any>;
    loading: boolean;
    buttonTitle:string;
    fromLoginPage?:boolean;
    onSubmit: (values: T, token: string, formikHelpers: FormikHelpers<T>) => void | Promise<void>;
    children: React.ReactNode;
}

export function ReusableForm<T extends FormikValues>({
    initialValues,
    validationSchema,
    onSubmit,
    fromLoginPage,
    children,
    loading,
    buttonTitle
}: AppFormProps<T>) {
    const [token, setToken] = useState('');

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, helpers) => {
                // if (!token) {
                //     helpers.setSubmitting(false);
                //     toast.error('Please verify you’re human!');
                //     return;
                // }
                onSubmit(values, token, helpers);
            }}
        >
            {({ handleSubmit }) => (
                <Form onSubmit={handleSubmit} className='w-100'>
                    {children}
                    {/* <div style={{ marginTop: 20 }}>
                        <Turnstile
                            sitekey={process.env.REACT_APP_CLOUDFLARE_TURNSTILE_SITE_KEY!}
                            onVerify={(newToken) => setToken(newToken)}
                            onExpire={() => setToken('')}
                        />
                    </div> */}

                    <CustomButton
                        className="w-100 mt-3 text-light"
                        title={buttonTitle}
                        type="submit"
                        loading={loading}
                    />
                    
                </Form>
            )}
        </Formik>
    );
}