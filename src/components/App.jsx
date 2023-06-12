import React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ImagePopup from './ImagePopup';
import ConfirmCardDeletePopup from './ConfirmCardDeletePopup';
import CurrentUserContext from '../contexts/CurrentUserContext';
import Loader from './Loader';
import Login from './Login';
import Register from './Register';
import InfoTooltip from './InfoTooltip';
import ProtectedRoute from './ProtectedRoute';
import auth from '../utils/auth';

function App() {
  const navigate = useNavigate();
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = React.useState(false);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = React.useState(false);
  const [cardDelete, setCardDelete] = React.useState({});
  const [selectedCard, setSelectedCard] = React.useState({});
  const [currentUser, setCurrentUser] = React.useState({});
  const [cards, setCards] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInfoTooltipShow, setIsInfoTooltipShow] = React.useState({ isOpen: false, successful: false });
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState('');

  React.useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      auth.checkToken(jwt).then(data => {
        if (data) {
          setEmail(data.data.email);
          setLoggedIn(true);
          navigate('/');
        }
      }).catch(console.error);
    }
  }, [navigate])

  React.useEffect(() => {
    if (loggedIn) {
      setLoggedIn(true);
      setIsLoading(true);
      Promise.all([api.getProfile(), api.getCards()])
        .then(([profile, listCards]) => {
          setCurrentUser(profile);
          setCards(listCards);
        }).catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [loggedIn])


  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(true);
  }

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(true);
  }

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(true);
  }

  const handleCardClick = (card) => {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
  }

  const handleCardDeleteClick = (data) => {
    setCardDelete(data);
    setIsDeletePopupOpen(true);
  }

  const closeAllPopups = () => {
    setIsEditProfilePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setIsDeletePopupOpen(false);
    setSelectedCard({});
    setIsInfoTooltipShow({ isOpen: false, successful: false })
  }

  const handleCardLike = (card) => {
    function makeRequest() {
      const isLiked = card.likes.some(i => i._id === currentUser._id);
      const method = isLiked ? 'DELETE' : 'PUT';

      return api.setLikedCard(card._id, method).then(res => setCards(state => state.map(c => c._id === card._id ? res : c)));
    }
    handleSubmit(makeRequest);
  }

  const handleCardDelete = () => {
    function makeRequest() {
      return api.deleteCard(cardDelete._id).then(setCards(array => array.filter(c => c._id !== cardDelete._id)));
    }
    handleSubmit(makeRequest);
  }

  const handleProfileFormSubmit = (name, about) => {
    function makeRequest() {
      return api.setProfile(name, about).then(setCurrentUser);
    }
    handleSubmit(makeRequest);
  }

  const handleUpdateAvatar = (avatar) => {
    function makeRequest() {
      return api.setAvatar(avatar).then(setCurrentUser);
    }
    handleSubmit(makeRequest);
  }

  const handleAddPlaceSubmit = (name, link) => {
    function makeRequest() {
      return api.addCard(name, link).then(res => setCards([res, ...cards]));
    }
    handleSubmit(makeRequest);
  }

  const handleSubmit = (request) => {
    setIsLoading(true);
    request()
      .then(closeAllPopups)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }

  const handleInfoTooltip = (res) => {
    setIsInfoTooltipShow({ isOpen: true, successful: res })
  }

  const handleLogin = ({ email, password }) => {
    setIsLoading(true);
    auth.loginUser(email, password).then(jwt => {
      if (jwt.token) {
        setEmail(email);
        setLoggedIn(true);
        localStorage.setItem('jwt', jwt.token);
        navigate('/');
      }
    }).catch(() => {
      console.error();
      handleInfoTooltip(false);
    }).finally(() => setIsLoading(false));
  }

  const handleRegister = ({ email, password }) => {
    setIsLoading(true);
    auth.registerUser(email, password).then(data => {
      if (data) {
        handleInfoTooltip(true);
        navigate('/sign-in');
      }
    }).catch(() => {
      handleInfoTooltip(false);
      console.error();
    }).finally(() => setIsLoading(false));
  }

  const handleSignOut = () => {
    localStorage.removeItem('jwt');
    setEmail('');
    setLoggedIn(false);
    navigate('/sign-in');
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Header
        email={email}
        onSignOut={handleSignOut}
      />
      <Routes>
        <Route path="/" element={
          <ProtectedRoute
            component={Main}
            loggedIn={loggedIn}
            onEditProfile={handleEditProfileClick}
            onEditAvatar={handleEditAvatarClick}
            onAddPlace={handleAddPlaceClick}
            onCardClick={handleCardClick}
            cards={cards}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDeleteClick}
          />}
        />
        <Route path="/sign-in" element={<Login onLogin={handleLogin} />} />
        <Route path="/sign-up" element={<Register onRegister={handleRegister} />} />
        <Route path="*" element={<Navigate to={loggedIn ? '/' : '/sign-in'} />} />
      </Routes>
      <Footer />
      <Loader isOpen={isLoading} />
      <InfoTooltip
        onClose={closeAllPopups}
        status={isInfoTooltipShow}
      />
      <EditProfilePopup
        isOpen={isEditProfilePopupOpen}
        onClose={closeAllPopups}
        onEditProfile={handleProfileFormSubmit}
      />

      <EditAvatarPopup
        isOpen={isEditAvatarPopupOpen}
        onClose={closeAllPopups}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <AddPlacePopup
        isOpen={isAddPlacePopupOpen}
        onClose={closeAllPopups}
        onAddPlace={handleAddPlaceSubmit}
      />

      <ImagePopup
        isOpen={isImagePopupOpen}
        card={selectedCard}
        onClose={closeAllPopups}
      />

      <ConfirmCardDeletePopup
        isOpen={isDeletePopupOpen}
        onClose={closeAllPopups}
        onCardDelete={handleCardDelete}
      />

    </CurrentUserContext.Provider>
  );
}

export default App;
