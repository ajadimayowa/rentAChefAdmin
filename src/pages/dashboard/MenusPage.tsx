import { Button, Card, Col, Image, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import ReusableInputs from "../../components/custom-input/ReusableInputs"
import { Form, Formik } from "formik"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import api from "../../app/api"
import { toast } from "react-toastify"
import moment from "moment"

const MenusPage = () => {
    const [onCreateChef, setOnCreateChef] = useState(false);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalItem, setTotalItem] = useState({
        total: 0,
        limit: 0,
        page: 0,
        totalPages: 0,
    });
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [refData, setRefData] = useState(false);
    const [chefs, setChefs] = useState<any[]>([]);
    const [bySearch, setBySearch] = useState(false);
    const [searchedName, setSearchedName] = useState('')


    const handlePagination = (value: number) => {
        setPage(value);
        setRefData(!refData);
    };

    const handlePrevious = () => {
        setPage(totalItem.page - 1);
        setRefData(!refData)
    };

    const handleNext = () => {
        // console.log({ seeCurren: totalItem.currentPage })
        setPage(totalItem?.page + 1);
        setRefData(!refData)
    };

    const infoCardData = [
        {
            id: '1',
            label: 'Revenue',
            desc: 'Total revenue',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: '5',
            isMoney: true
        },
        {
            id: '2',
            label: 'Customers',
            desc: 'No of active customers',
            icon: 'bi bi-person-workspace',
            path: '/admin',
            count: '3'
        },
        {
            id: '3',
            label: 'Chefs',
            desc: 'No of active chefs',
            icon: 'bi bi-backpack',
            path: '/chefs',
            count: '2'
        }

    ]

    const searchChef = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/chefs?name=${searchedName}&limit=${limit}&page=${page}`);
            // setChefs(res?.data?.payload);
            // setTotalItem({ ...res.data?.meta });
            // loadStates()
            // localStorage.setItem('userToken',res?.data?.token);
            // localStorage.setItem('userId',res?.data?.payload?.id);
            // dispatch(setUserData(res?.data?.payload))
            // navigate('/dashboard')
            // toast.success('Login Successful!')
            // setUserEmail(values.email);
            setLoading(false);
            // setStep(2); // proceed to OTP verification
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Invalid Credentials')
        }
    }
    const fetchChefs = async () => {
        setLoading(true);
        if (bySearch) {
            searchChef()
        } else {
            try {
                const res = await api.get(`/chefs?limit=${limit}&page=${page}`);
                // setChefs(res?.data?.payload);
                // setTotalItem({ ...res.data?.meta });
                // loadStates()
                // localStorage.setItem('userToken',res?.data?.token);
                // localStorage.setItem('userId',res?.data?.payload?.id);
                // dispatch(setUserData(res?.data?.payload))
                // navigate('/dashboard')
                // toast.success('Login Successful!')
                // setUserEmail(values.email);
                setLoading(false);
                // setStep(2); // proceed to OTP verification
            } catch (error) {
                console.error(error);
                setLoading(false);
                toast.error('Invalid Credentials')
            }
        }
    };

    useEffect(() => {
        fetchChefs()
    }, [refData])
    return (
        <div>
            <div className="">
                <h5>Food Menu Page</h5>
                <p>See a list of all your available menus</p>


            </div>
            <div className="mt-5">
                <div className="w-100 d-flex justify-content-between mb-4">
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <Formik
                            initialValues={{ 'userSearch': '' }}
                            onSubmit={(v) => { setBySearch(true);setSearchedName(v?.userSearch); setRefData(!refData) }}
                        >
                            {
                                ({ handleSubmit }) => (
                                    <Form onSubmit={handleSubmit}>
                                        <ReusableInputs onChange={(e) => setSearchedName(e.currentTarget.value)} placeholder="Search by menu name..." inputType="text-input" id="userSearch" name="userSearch" />
                                    </Form>
                                )
                            }

                        </Formik>

                        <CustomIconButton onClick={() => setOnCreateChef(true)} className="text-light" title="+ Add New" />
                    </div>
                    <div></div>

                </div>

                <table className="table">
                    <thead className="thead-light">
                        <tr>
                            <th className="bg-primary text-light" scope="col">#</th>
                            <th className="bg-primary text-light" scope="col">Chef ID</th>
                            <th className="bg-primary text-light" scope="col">Full name</th>
                            <th className="bg-primary text-light" scope="col">State</th>
                            <th className="bg-primary text-light" scope="col">Location</th>
                            <th className="bg-primary text-light" scope="col">Created At</th>
                            <th className="bg-primary text-light" scope="col">Passport</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center"><td colSpan={8}>{loading && <Spinner />}</td></tr>
                        {
                            chefs.map((chef, index: number) => (<tr role="button" onClick={() => navigate(`/dashboard/chef/${chef?.id}`)}>
                                <th scope="row">{index + 1}</th>
                                <td>{chef?.staffId}</td>
                                <td>{chef?.name}</td>
                                <td>{chef?.state}</td>
                                <td>{chef?.location}</td>
                                <td>{moment(chef?.createdAt).format('dd-mm-y')}</td>
                                <td><Image height={50} width={40} src={chef?.profilePic} /></td>
                                {/* <td><i className="bi bi-three-dots-vertical"></i></td> */}
                            </tr>))
                        }
                        <tr className="text-center"><td colSpan={8}>{!loading && chefs?.length<1 &&'No Data Available'}</td></tr>
                    </tbody>
                </table>
            </div>

            {chefs.length > 0 && (
                <nav className="mt-5" aria-label="Page navigation example">
                    <ul className="pagination justify-content-center">
                        <Button onClick={handlePrevious} className="page-item" disabled={totalItem.page == 1}>
                            Previous
                        </Button>
                        {Array(totalItem.totalPages)
                            .fill('')
                            .map((value: any, index: any): any => (
                                <li
                                    key={index}
                                    style={{
                                        backgroundColor: index + 1 == totalItem.page ? '#3F718D' : '',
                                        cursor: 'pointer',
                                    }}
                                    className="page-item"
                                    onClick={() => handlePagination(index + 1)}
                                >
                                    <a className="page-link">{index + 1}</a>
                                </li>
                            ))}
                        <Button onClick={handleNext} className="page-item" disabled={totalItem.page == totalItem.totalPages}>
                            Next
                        </Button>
                    </ul>
                </nav>
            )}
            <NewChefModal on={onCreateChef} off={() => {setOnCreateChef(false); window.location.reload(); setRefData(!refData)}} onLogin={() => console.log('ok')} />
        </div>
    )
}
export default MenusPage