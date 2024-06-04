/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { DateRangePicker } from 'rsuite';
import svg from '../assets/svg';
import {
  getDateFilters,
  isLaunchesByCustomDates,
} from '../store/selectors/dashboard';
import {
  CurrentFilter,
  CurrentFilterWrapper,
  DateFiltersByLabel,
  DateFiltersByLabelContainer,
  FilterByDateContainer,
  FilterByDateIcon,
  FilterByDateOverlay,
} from '../styled/components/FilterByDate';
import useQuery from '../utils/hooks/useQuery';

function FilterByDate() {
  const { currentDateFilter, dateFilters, currentFilterData } = useSelector(
    getDateFilters
  );
  const isLauchesByCustomDates = useSelector(isLaunchesByCustomDates);

  const wrapperRef = useRef(null);

  const [showFilters, setShowFilters] = useState(false);
  const [customDates, setCustomDates] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();

  useEffect(() => {
    if (isLauchesByCustomDates) {
      const start = query.get('start');
      const end = query.get('end');
      setCustomDates(
        moment.range(moment(new Date(start)), moment(new Date(end)))
      );
    } else {
      const initialDates = !currentFilterData.dates.start
        ? null
        : moment.range(
            moment(currentFilterData.dates.start),
            moment(currentFilterData.dates.end)
          );
      setCustomDates(initialDates);
    }
  }, [isLauchesByCustomDates, currentFilterData]);

  function toggleFilter() {
    setShowFilters(!showFilters);
  }

  function onFilterClick(filter) {
    const dateFilterQuery = query.get('dateFilter');
    const startFilter = query.get('start');
    const endFilter = query.get('end');
    const currentPage = query.get('page');

    let searchParams = new URLSearchParams(location.search);

    if (startFilter && endFilter) {
      searchParams.delete('start');
      searchParams.delete('end');
    }

    if (currentPage) {
      searchParams.delete('page');
    }

    searchParams.set('dateFilter', filter);

    navigate(`?${searchParams.toString()}`);
    toggleFilter();
  }

  function handleDateSelect(dates) {
    setCustomDates(dates);
    let startDate = dates.start.toISOString().split('T')[0];
    let endDate = dates.end.toISOString().split('T')[0];

    const startFilter = query.get('start');
    const endFilter = query.get('end');
    const dateFilterQuery = query.get('dateFilter');
    const currentPage = query.get('page');

    let searchParams = new URLSearchParams(location.search);

    if (currentPage) {
      searchParams.delete('page');
    }

    if (dateFilterQuery) {
      searchParams.delete('dateFilter');
    }

    searchParams.set('start', startDate);
    searchParams.set('end', endDate);

    navigate(`?${searchParams.toString()}`);
    toggleFilter();
  }

  function handleDismiss(event) {
    if (event.target !== wrapperRef.current) return;
    toggleFilter();
  }

  return (
    <>
      <CurrentFilterWrapper onClick={toggleFilter}>
        <FilterByDateIcon src={svg.calender} />
        <CurrentFilter>
          {isLauchesByCustomDates ? 'Custom Dates' : currentFilterData.label}
        </CurrentFilter>
        <FilterByDateIcon src={svg.arrowRight} rotate="90deg" />
      </CurrentFilterWrapper>
      {showFilters && (
        <FilterByDateOverlay onClick={handleDismiss} ref={wrapperRef}>
          <FilterByDateContainer>
            <DateFiltersByLabelContainer>
              {dateFilters.map((filter) => (
                <DateFiltersByLabel
                  onClick={() => onFilterClick(filter.value)}
                  key={filter.label}
                  active={
                    isLauchesByCustomDates
                      ? false
                      : filter.value === currentDateFilter
                  }
                >
                  {filter.label}
                </DateFiltersByLabel>
              ))}
            </DateFiltersByLabelContainer>
            <DateRangePicker
              numberOfCalendars={2}
              selectionType="range"
              onSelect={handleDateSelect}
              value={customDates}
            />
          </FilterByDateContainer>
        </FilterByDateOverlay>
      )}
    </>
  );
}

export default FilterByDate;
