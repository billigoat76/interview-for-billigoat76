import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { useNavigate, useLocation } from 'react-router-dom'
import { DateRange } from 'react-date-range'

import svg from '../assets/svg'
import {
  getDateFilters,
  isLaunchesByCustomDates,
} from '../store/selectors/dashboard'
import {
  CurrentFilter,
  CurrentFilterWrapper,
  DateFiltersByLabel,
  DateFiltersByLabelContainer,
  FilterByDateContainer,
  FilterByDateIcon,
  FilterByDateOverlay,
} from '../styled/components/FilterByDate'
import useQuery from '../utils/hooks/useQuery'

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

function FilterByDate() {
  const { currentDateFilter, dateFilters, currentFilterData } = useSelector(
    getDateFilters
  )
  const isLauchesByCustomDates = useSelector(isLaunchesByCustomDates)

  const wrapperRef = useRef(null)

  const [showFilters, setShowFilters] = useState(false)
  const [customDates, setCustomDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ])

  const navigate = useNavigate()
  const query = useQuery()
  const location = useLocation()

  useEffect(() => {
    if (isLauchesByCustomDates) {
      const start = query.get('start')
      const end = query.get('end')
      setCustomDates([
        {
          startDate: new Date(start),
          endDate: new Date(end),
          key: 'selection'
        }
      ])
    } else {
      const initialDates = !currentFilterData.dates.start
        ? [{
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
          }]
        : [{
            startDate: new Date(currentFilterData.dates.start),
            endDate: new Date(currentFilterData.dates.end),
            key: 'selection'
          }]
      setCustomDates(initialDates)
    }
  }, [isLauchesByCustomDates, currentFilterData])

  function toggleFilter() {
    setShowFilters(!showFilters)
  }

  function onFilterClick(filter) {
    const dateFilterQuery = query.get('dateFilter')
    const startFilter = query.get('start')
    const endFilter = query.get('end')
    const currentPage = query.get('page')

    let searchString = location.search

    if (startFilter && endFilter) {
      searchString = searchString.replace(/[&]?start=[A-Z0-9-:]*[&]?/g, ``)

      searchString = searchString.replace(/[&]?end=[A-Z0-9-:]*[&]?/g, ``)
    }

    if (currentPage) {
      searchString = searchString.replace(/[&]?page=[0-9]*[&]?/g, ``)
    }

    if (!dateFilterQuery) {
      navigate(
        searchString
          ? `${searchString}&dateFilter=${filter}`
          : `/?dateFilter=${filter}`
      )
    } else {
      const n = searchString.replace(
        /dateFilter=[a-z0-9_]*/g,
        `dateFilter=${filter}`
      )
      navigate(`/${n}`)
    }

    toggleFilter()
  }

  function handleDateSelect(ranges) {
    const { selection } = ranges;
    setCustomDates([selection]);

    let startDate = selection.startDate.toISOString()
    startDate = startDate.slice(0, startDate.indexOf('T'))

    let endDate = selection.endDate.toISOString()
    endDate = endDate.slice(0, endDate.indexOf('T'))

    const startFilter = query.get('start')
    const endFilter = query.get('end')
    const dateFilterQuery = query.get('dateFilter')
    const currentPage = query.get('page')

    let searchString = location.search

    if (currentPage) {
      searchString = searchString.replace(/[&]?page=[0-9]*[&]?/g, ``)
    }

    if (dateFilterQuery) {
      searchString = searchString.replace(/[&]?dateFilter=[a-z0-9_]*[&]?/g, ``)
    }

    if (!startFilter && !endFilter) {
      navigate(
        searchString
          ? `${searchString}&start=${startDate}&end=${endDate}`
          : `/?start=${startDate}&end=${endDate}`
      )
    } else {
      let dateReplaced = searchString.replace(
        /start=[A-Z0-9-:]*/g,
        `start=${startDate}`
      )
      dateReplaced = dateReplaced.replace(/end=[A-Z0-9-:]*/g, `end=${endDate}`)

      navigate(`/${dateReplaced}`)
    }
    toggleFilter()
  }

  function handleDismiss(event) {
    if (event.target !== wrapperRef.current) return

    toggleFilter()
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
            <DateRange
              ranges={customDates}
              onChange={handleDateSelect}
            />
          </FilterByDateContainer>
        </FilterByDateOverlay>
      )}
    </>
  )
}

export default FilterByDate
