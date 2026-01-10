import { Badge, Button, Card, Col, Image, ListGroup, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import chefAvatar from '../../assets/images/cookemoji.png'
import { useDispatch } from "react-redux"
import api from "../../app/api"
import { toast } from "react-toastify"
import CreateChefMenu from "../../components/modals/chef/CreateChefMenu"
import UpdateChefProfileModal from "../../components/modals/chef/UpdateChefProfileModal"
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik"
import * as Yup from "yup";

export interface IMenu {
    basePrice: number | null,
    chef: {
        name: string;
        email: string;
        id: string;
    };
    createdAt: string;
    id: string;
    items: any[];
    menuPic: string;
    title: string;
    updatedAt: string;
}

const UpdateMenuPage = () => {
    const [refData, setRefData] = useState(false)
    const [onCreateChef, setOnCreateChef] = useState(false);
    const [onUpdateChefProfile, setOnUpdateChefProfile] = useState(false)
    const params: any = useParams();
    const id = params?.id;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [menu, setMenu] = useState<IMenu>()
    // const [chefMenu, setChefMenu] = useState<IMenu[]>([])


    const mapMenuItemsToFormik = (menu: any, menuId: string) => ({
        title:menu?.title,
        basePrice:menu?.basePrice,
        menuId
    });


    const MenuValidationSchema = Yup.object().shape({
title:Yup.string().required('Required'),
basePrice:Yup.string().required('Required')
    });
    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await api.get(`menu/${id}`);
            setMenu(res?.data?.payload)
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
            toast.error('Failed to fetch menu')
        }
    };

    const updateMenu = async (val: any) => {
        setLoading(true);
        try {
            const res = await api.put(`menu/${menu?.id}`, val);
            if (res?.data?.success) {
                toast.success('Menu updated succesfully!');
                window.location.reload()
            }

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
            toast.error('Failed to fetch menu')
        }
    };

    useEffect(() => {
        fetchMenu();
    }, [refData])
    return (
        <div>
            {/* <div className="d-flex justify-content-end">
                <CustomIconButton className="text-light" title="Create Menu" />

            </div> */}
            <h3>Update Menu</h3>

            <Row className="mt-4">
                <Col sm={5}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">

                                {/* <Button onClick={() => setOnUpdateChefProfile(true)} variant="outline border">Update profile</Button> */}
                            </div>
                            {
                                loading ? <Spinner size="sm" /> :
                                    <div className="d-flex gap-4 mt-4">
                                        <div className="">
                                            {
                                                menu?.menuPic ? <Image height={250} className="rounded-3" src={menu?.menuPic} /> :
                                                    <Image height={250} className="rounded-3" src={chefAvatar} />}

                                        </div>
                                    </div>
                            }

                        </Card.Body>
                    </Card>
                </Col>

                <Col>
                    <Card>
                        <Card.Header className="fw-bold">Details</Card.Header>
                        <Card.Body>
                            <div className="">
                                    <Formik
                                        initialValues={mapMenuItemsToFormik(menu, id)}
                                        validationSchema={MenuValidationSchema}
                                        enableReinitialize
                                        onSubmit={(values) => {
                                            const payload = {
                                                ...values,
                                            };
                                            updateMenu(payload);
                                            // POST to backend
                                        }}
                                    >
                                        {() => (
                                            <Form>
                                               <div>
                                                 <p className="p-0 m-0">Title</p>
                                                <Field name='title' />
                                                <ErrorMessage className="text-danger" name="title" component="div" />
                                               </div>

                                            <div className="mt-3">
                                                <p className="p-0 m-0">Price/person</p>
                                                <Field name='basePrice'/>
                                                <ErrorMessage className="text-danger" name='basePrice' component="div" />
                                            </div>

                                          

                                               <div className="w-100">
                                                 <Button className="mt-4" type="submit" onClick={() => setOnUpdateChefProfile(true)}>Update</Button>
                                               </div>
                                            </Form>
                                        )}
                                    </Formik>

                                      <div className="mt-5 d-flex gap-3">
                                                {
                                                    menu?.items.map((item)=>(<div><Badge className="p-2 bg-info">{item?.name}</Badge></div>))
                                                }
                                            </div>

                            </div>


                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {/* <CreateChefMenu chefName={chef?.name || ''} chefId={chef?.id || ''} on={onCreateChef} off={() => setOnCreateChef(false)} onLogin={() => console.log('ok')} /> */}
            {/* <UpdateChefProfileModal chefName={chef?.name || ''} chefId={chef?.id || ''} on={onUpdateChefProfile} off={() => setOnUpdateChefProfile(false)} onLogin={() => console.log('ok')} /> */}
        </div>
    )
}
export default UpdateMenuPage