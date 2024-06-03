import { HeaderContainer, HeaderLogo } from '../styled/components/Header'
import svg from '../assets/svg/logo.svg'

function Header() {
  return (
    <HeaderContainer >
      <HeaderLogo src={svg} alt="SpaceX"  className ="mx-auto"/>
    </HeaderContainer>
  )
}

export default Header