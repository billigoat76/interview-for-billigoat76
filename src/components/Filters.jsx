/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import svg from '../assets/svg';
import { getFiltersState } from '../store/selectors/dashboard';
import {
  Filter,
  FiltersContainer,
  FiltersIcon,
  FiltersWrapper,
  Option,
  OptionsWrapper,
} from '../styled/components/Filters';
import useQuery from '../utils/hooks/useQuery';

function Filters() {
  const [showFilter, setShowFilter] = useState(false);

  const { currentFilter, allFilters } = useSelector(getFiltersState);
  const navigate = useNavigate();
  const query = useQuery();

  function toggleFilter() {
    setShowFilter(!showFilter);
  }

  function handleOnChange(filter) {
    if (filter !== currentFilter) {
      const newFilter = query.get('filter');
      const currentPage = query.get('page');

      let searchParams = new URLSearchParams(location.search);

      if (currentPage) {
        searchParams.delete('page');
      }

      searchParams.set('filter', filter);

      navigate(`?${searchParams.toString()}`);
      toggleFilter();
    }
  }

  const currentFilterLabel = allFilters.find(
    (filter) => filter.value === currentFilter
  )?.label;

  return (
    <FiltersContainer>
      <FiltersWrapper onClick={toggleFilter}>
        <FiltersIcon src={svg.calender} />
        <Filter>{currentFilterLabel}</Filter>
        <FiltersIcon src={svg.arrowRight} rotate="90deg" />
      </FiltersWrapper>
      {showFilter && (
        <OptionsWrapper>
          {allFilters.map((filter) => (
            <Option
              active={filter.value === currentFilter}
              onClick={() => handleOnChange(filter.value)}
              key={filter.label}
            >
              {filter.label}
            </Option>
          ))}
        </OptionsWrapper>
      )}
    </FiltersContainer>
  );
}

export default Filters;
