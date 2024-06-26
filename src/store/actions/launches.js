import moment from 'moment'

import { getLaunches } from '../../utils/api'
import { toggleLoading } from './loading'
import { filterQueries, toogleFilterByCustomDates } from './filters'

export const launchesActionTypes = {
  GET_LAUNCHES: 'GET_LAUNCHES',
  CHANGE_PAGE_NO: 'CHANGE_PAGE_NO',
  LAUCHES_BY_CUSTOM_DATES: 'LAUCHES_BY_CUSTOM_DATES',
}

function dispatchSetLaunches(data) {
  return {
    type: launchesActionTypes.GET_LAUNCHES,
    payload: {
      data,
    },
  }
}

function dispatchLaunchesByCustomDates(data = null) {
  return {
    type: launchesActionTypes.LAUCHES_BY_CUSTOM_DATES,
    payload: {
      data,
    },
  }
}

function changeCurrentPage(pageNo) {
  return {
    type: launchesActionTypes.CHANGE_PAGE_NO,
    payload: {
      data: pageNo,
    },
  }
}

export const getLaunchesRequested = ({
  page,
  filter,
  dateFilter,
} = {}) => async (dispatch, getState) => {
  const { launches, filters } = getState()
  const { limit, currentPage } = launches
  const { dateFilters, currentDateFilter, dataByCustomDates } = filters

  const searchByFilter = filter || filters.currentFilter
  const searchQuery = filterQueries[searchByFilter]
  const pageNo = page || currentPage
  const filterByDate = dateFilter || currentDateFilter

  if (dataByCustomDates) {
    dispatch(dispatchLaunchesByCustomDates())
    dispatch(toogleFilterByCustomDates())
  }

  dispatch(changeCurrentPage(pageNo))

  if (
    launches.data[searchByFilter] &&
    launches.data[searchByFilter][filterByDate] &&
    launches.data[searchByFilter][filterByDate].docs[pageNo]
  ) {
    return
  }

  const currentDateFilterData = dateFilters.find(
    (f) => f.value === filterByDate
  )

  let dateQuery = {}
  if (currentDateFilterData) {
    const { dates } = currentDateFilterData

    if (dates?.start && dates?.end) {
      dateQuery = {
        date_utc: {
          $gte: dates.start,
          $lte: dates.end,
        },
      }
    }
  }

  dispatch(toggleLoading())
  try {
    const query = { ...searchQuery, ...dateQuery }

    const { data } = await getLaunches({
      page: pageNo,
      limit,
      query,
    })

    dispatch(
      dispatchSetLaunches({
        launches: data,
        filter: searchByFilter,
        dateFilter: filterByDate,
      })
    )
  } catch (e) {
    console.log(e)
  } finally {
    dispatch(toggleLoading())
  }
}

export const getLaunchesByCustomDates = ({
  page = 1,
  start,
  end,
  filter,
  replace = false,
}) => async (dispatch, getState) => {
  const { launches, filters } = getState()
  const { limit, currentPage, launchesByCustomDates } = launches
  const { dataByCustomDates } = filters
  const pageNo = page || currentPage

  if (!dataByCustomDates) {
    dispatch(toogleFilterByCustomDates())
  }

  if (!replace && launchesByCustomDates.data[pageNo]) {
    dispatch(changeCurrentPage(page))
    return
  }

  if (page && page !== currentPage) {
    dispatch(changeCurrentPage(page))
  }

  try {
    dispatch(toggleLoading())

    const query = {
      date_utc: {
        $gte: moment(start).toISOString(),
        $lte: moment(end).toISOString(),
      },
      ...filterQueries[filter || filters.currentFilter],
    }

    const { data } = await getLaunches({
      page: pageNo,
      limit,
      query,
    })

    dispatch(
      dispatchLaunchesByCustomDates({
        launches: data,
        replace,
      })
    )
  } catch (e) {
    console.log(e)
  } finally {
    dispatch(toggleLoading())
  }
}