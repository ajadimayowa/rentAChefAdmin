import { Button, Card, Col, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import ChartCard from "../../components/chart/ChartCard"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import api from "../../app/api"


interface IHomeCard {
    revenue: number,
    customers: number,
    chefs: number,
}
interface IDBoard {
    cardData: IHomeCard,
    bookings: any[]

}
const DashboardPage = () => {
    const [onCreateChef, setOnCreateChef] = useState(false)
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [dboard, setDBboard] = useState<IDBoard>();
    const [limit,setLimit] = useState(10);
    const infoCardData = [
        {
            id: '1',
            label: 'Revenue',
            desc: 'Total revenue',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: dboard?.cardData.revenue,
            isMoney: true
        },
        {
            id: '2',
            label: 'Customers',
            desc: 'No of active customers',
            icon: 'bi bi-person-workspace',
            path: '/admin',
            count: dboard?.cardData.customers,
        },
        {
            id: '3',
            label: 'Chefs',
            desc: 'No of active chefs',
            icon: 'bi bi-backpack',
            path: '/chefs',
            count: dboard?.cardData.chefs
        }

    ]

    const chartData = [
        { name: 'Jan', users: 120 },
        { name: 'Feb', users: 210 },
        { name: 'Mar', users: 180 },
        { name: 'Apr', users: 260 },
        { name: 'May', users: 300 },
    ];

    const fetchAdmin = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/dashboard");
            setDBboard(res?.data?.payload);
            // console.log("chefs:", res.data);
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
    };

    useEffect(() => {
        fetchAdmin()
    }, [])

    return (
        <div>
            {!loading && <div className="d-flex justify-content-end">
                <CustomIconButton onClick={() => setOnCreateChef(true)} className="text-light" title="Create New Chef" />

            </div>}

            <Row className="mt-4">
                {
                    loading && <Col className="text-center"><Spinner size="sm" /></Col>
                }
            </Row>
            <Row className="mt-4">

                {
                    infoCardData.map((card) => (<Col>
                        <Card>
                            <Card.Body>
                                <p className="fw-bold m-0 p-0">
                                    {
                                        card.label
                                    }
                                </p>
                                <p>
                                    {
                                        card.desc
                                    }
                                </p>
                                <h3>
                                    {
                                        card.isMoney ? convertToThousand(card.count ?? '0') : card.count ?? '-'
                                    }
                                </h3>

                            </Card.Body>
                        </Card>
                    </Col>))
                }
            </Row>
            {!loading && <div className="d-flex justify-content-end mt-3">
                <div className="d-flex gap-3">
                    <a href="">Download Report</a>
                    <a href="">Share Report</a>
                </div>

            </div>}

            <Row className=" m-0 mt-4">
                <Col>
                    <ChartCard
                        title="Booking Trend"
                        data={chartData}
                        xKey="name"
                        dataKey="users"
                        chartType="line"
                    />
                </Col>
            </Row>
            <NewChefModal on={onCreateChef} off={() => setOnCreateChef(false)} onLogin={() => console.log('ok')} />
        </div>
    )
}
export default DashboardPage