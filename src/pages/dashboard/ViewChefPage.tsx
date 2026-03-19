import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Card, Col, Image, Row, Spinner } from 'react-bootstrap';
import { convertToThousand } from '../../utils/helpers';
import chefAvatar from '../../assets/images/cookemoji.png';
import api from '../../app/api';
import { toast } from 'react-toastify';
import CreateChefMenu from '../../components/modals/chef/CreateChefMenu';
import UpdateChefProfileModal from '../../components/modals/chef/UpdateChefProfileModal';
import UpdateChefMenu from '../../components/modals/chef/UpdateChefMenu';

interface IService {
    id: string;
    name: string;
}

interface IChef {
    id?: string;
    name?: string;
    category: {
        name?: string;
    }
    profilePic?: string;
    location?: string;
    state?: string;
    specialties?: string[];
    phoneNumber?: string | number;
    servicesOffered?: IService[];
}

interface IMenu {
    id?: string;
    _id?: string;
    month?: string;
    weeks?: any[];
    menuPic?: string;
    procurement?: any[];
}

const ViewChefPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const [chef, setChef] = useState<IChef | null>(null);
    const [chefMenu, setChefMenu] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [onCreateChef, setOnCreateChef] = useState(false);
    const [onUpdateChefMenu, setOnUpdateChefMenu] = useState(false);
    const [onUpdateChefProfile, setOnUpdateChefProfile] = useState(false);
    const [totalChefBooking, setTotalChefBooking] = useState<number | null>(null);
    const [totalCompletedBooking, setTotalCompletedBooking] = useState<number | null>(null);
    const [totalUpcoming, setTotalUpcoming] = useState<number | null>(null);
    const [servicesOffered, setServicesOffered] = useState<IService[]>([]);
    const [clickedChefMenu,setClickedChefMenu] = useState<IMenu | null>(null);

    const fetchChef = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await api.get(`chef/${id}`);
            const payload = res?.data?.payload;
            if (!payload) {
                setChef(null);
                return;
            }

            if (payload.chef) {
                setChef(payload.chef);
                setChefMenu(payload.getTheChefMenu || []);
                setTotalChefBooking(payload.totalChefBooking ?? null);
                setTotalCompletedBooking(payload.totalCompletedBooking ?? null);
                setTotalUpcoming(payload.totalUpcoming ?? null);
                setServicesOffered(payload.servicesOffered || []);
            } else {
                setChef(payload as IChef);
            }
        } catch (err) {
            console.error(err);
            toast.error('Unable to fetch chef');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChef();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const infoCardData = [
        { id: '1', label: 'Total Menu', desc: 'Total menu for this chef', count: chefMenu?.length ?? 0, isMoney: false },
        { id: '2', label: 'Bookings Completed', desc: 'Completed bookings', count: totalCompletedBooking ?? '-', isMoney: false },
        { id: '3', label: 'Upcoming', desc: 'Upcoming bookings', count: totalUpcoming ?? '-', isMoney: false },
        { id: '4', label: 'Total Bookings', desc: 'All bookings', count: totalChefBooking ?? '-', isMoney: false },
    ];

    return (
        <div>
            <Row className="mt-4">
                {infoCardData.map((card) => (
                    <Col key={card.id}>
                        <Card>
                            <Card.Body>
                                <p className="fw-bold m-0 p-0">{card.label}</p>
                                <p>{card.desc}</p>
                                <h3>{card.isMoney ? convertToThousand(String(card.count)) : card.count}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="d-flex w-100 gap-3 justify-content-end text-end">
                {/* <a href="/dashboard/menus">Go to menu list</a> */}
                <a href="#">View Booking history</a>
            </div>

            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <p className="fw-bold m-0 p-0">Chef Profile</p>
                                <Button onClick={() => setOnUpdateChefProfile(true)} variant="outline border">
                                    Update profile
                                </Button>
                            </div>

                            {loading ? (
                                <Spinner size="sm" />
                            ) : (
                                <div className="d-flex gap-4 mt-4 align-items-center">
                                    <div>
                                        {chef?.profilePic ? (
                                            <Image height={250} width={300} className="rounded-3" src={chef.profilePic} />
                                        ) : (
                                            <Image height={250} width={300} className="rounded-3" src={chefAvatar} />
                                        )}
                                    </div>

                                    <div>
                                        <label>Full Name</label>
                                        <p>
                                            {chef?.name ?? '-'} <small>{` (${chef?.category?.name ?? '-'})`}</small>
                                        </p>

                                        <label>Location</label>
                                        <p>{`${chef?.location ?? '-'}, ${chef?.state ?? '-'}`}</p>

                                        <label>Specialties</label>
                                        {chef?.specialties?.length ? (
                                            chef.specialties.map((spe: string, idx: number) => (
                                                <p key={idx} className="mb-1">
                                                    {spe}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="mb-1">-</p>
                                        )}
                                    </div>

                                    <div>
                                        <label>Phone Number</label>
                                        <p>{chef?.phoneNumber ?? '-'}</p>

                                        <label>Services</label>
                                        {servicesOffered.length ? (
                                            servicesOffered.map((s: IService) => (
                                                <p key={s.id} className="p-0 m-0">
                                                    {s.name}
                                                </p>
                                            ))
                                        ) : chef?.servicesOffered?.length ? (
                                            chef.servicesOffered.map((s: IService, i: number) => (
                                                <p key={s.id || i} className="p-0 m-0">
                                                    {s.name}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="p-0 m-0">-</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <p className="fw-bold m-0 p-0">Chef Menu</p>
                                <Button onClick={() => setOnCreateChef(true)} variant="outline border">
                                    Add Menu
                                </Button>
                            </div>

                            <div className="mt-4 gap-3">
                                {chefMenu?.length ? (
                                    chefMenu.map((menu: IMenu) => (
                                        <div key={menu.id || menu._id}>
                                            <Card
                                                className="m-2"
                                                style={{
                                                    backgroundImage: menu?.menuPic ? `url(${menu.menuPic})` : 'none',
                                                    backgroundSize: 'cover',
                                                    minHeight: 250,
                                                    backgroundPosition: 'center',
                                                }}
                                            >
                                                <Card.Header className="bg-dark text-light">
                                                    <div className="d-flex justify-content-between w-100">
                                                        <p className="p-0 m-0 text-light fw-bold">{menu?.month}</p>
                                                        <div onClick={()=>{setClickedChefMenu(menu); setOnUpdateChefMenu(true)}} className='d-flex gap-2'>
                                                            Edit
                                                            <i className="bi bi-pencil-square"></i>
                                                        </div>
                                                    </div>
                                                </Card.Header>

                                                <Card.Body>
                                                    {menu.weeks?.map((week: any, wi: number) => (
                                                        <Card key={wi} className="mb-3">
                                                            <Card.Header>{`Week ${week?.weekNumber}`}</Card.Header>
                                                            <Card.Body>
                                                                <Row>
                                                                    {week?.days?.map((days: any, di: number) => (
                                                                        <Col key={di}>
                                                                            <div className="m-2 border border-2 p-2">
                                                                                <p className="fw-bold m-0 p-0">{days?.day}</p>
                                                                                <table className="table table-striped">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th scope="col">Breakfast</th>
                                                                                            <th scope="col">Lunch</th>
                                                                                            <th scope="col">Dinner</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td className='border'>{days?.breakfast}</td>
                                                                                            <td className='border'>{days?.lunch}</td>
                                                                                            <td className='border'>{days?.dinner}</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </Col>
                                                                    ))}
                                                                </Row>
                                                            </Card.Body>
                                                        </Card>
                                                    ))}
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    ))
                                ) : (
                                    <div className="fw-bold">{!loading && `This chef has no menu`}</div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <CreateChefMenu chefName={chef?.name || ''} chefId={chef?.id || ''} on={onCreateChef} off={() => setOnCreateChef(false)} />
            <UpdateChefMenu chefName={chef?.name || ''} menu={clickedChefMenu} on={onUpdateChefMenu} off={() => setOnUpdateChefMenu(false)} />
            <UpdateChefProfileModal chefName={chef?.name || ''} chefId={chef?.id || ''} on={onUpdateChefProfile} off={() => setOnUpdateChefProfile(false)} onLogin={() => console.log('ok')} />
        </div>
    );
};

export default ViewChefPage;