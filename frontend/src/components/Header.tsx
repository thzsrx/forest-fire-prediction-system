import { Link } from "react-router-dom";
import { CitySearch } from "./CitySearch";

const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur py-2 supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to={'/'}>
                    <p className="h-4">Forest Fire Prediction</p>
                </Link>
                <div className="flex gap-4">
                    {/* search */}
                    <CitySearch />
                </div>
            </div>
        </header>
    )
};

export default Header;
