import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/protected-route'
import AppLayout from '@/layouts/app-layout'
import PlaceholderHome from '@/pages/placeholder-home'
import SessionsNew from '@/pages/sessions/new'
import CompaniesEdit from '@/pages/companies/edit'
import CompaniesIndex from '@/pages/companies/index'
import CompaniesNew from '@/pages/companies/new'
import CompaniesShow from '@/pages/companies/show'
import UsersEdit from '@/pages/users/edit'
import UsersIndex from '@/pages/users/index'
import UsersNew from '@/pages/users/new'
import UsersShow from '@/pages/users/show'
import ChaptersEdit from '@/pages/chapters/edit'
import ChaptersIndex from '@/pages/chapters/index'
import ChaptersNew from '@/pages/chapters/new'
import ChaptersShow from '@/pages/chapters/show'
import AxesEdit from '@/pages/axes/edit'
import AxesIndex from '@/pages/axes/index'
import AxesNew from '@/pages/axes/new'
import AxesShow from '@/pages/axes/show'
import PhasesEdit from '@/pages/phases/edit'
import PhasesIndex from '@/pages/phases/index'
import PhasesNew from '@/pages/phases/new'
import PhasesShow from '@/pages/phases/show'
import ToolsEdit from '@/pages/tools/edit'
import ToolsIndex from '@/pages/tools/index'
import ToolsNew from '@/pages/tools/new'
import ToolsShow from '@/pages/tools/show'
import MeetingsEdit from '@/pages/meetings/edit'
import MeetingsIndex from '@/pages/meetings/index'
import MeetingsNew from '@/pages/meetings/new'
import MeetingsShow from '@/pages/meetings/show'
import ClustersEdit from '@/pages/clusters/edit'
import ClustersIndex from '@/pages/clusters/index'
import ClustersNew from '@/pages/clusters/new'
import ClustersShow from '@/pages/clusters/show'
import TeamsEdit from '@/pages/teams/edit'
import TeamsIndex from '@/pages/teams/index'
import TeamsNew from '@/pages/teams/new'
import TeamsShow from '@/pages/teams/show'
import MembersEdit from '@/pages/members/edit'
import MembersNew from '@/pages/members/new'
import EventsEdit from '@/pages/events/edit'
import EventsIndex from '@/pages/events/index'
import EventsNew from '@/pages/events/new'
import EventsShow from '@/pages/events/show'
import AttendancesEdit from '@/pages/attendances/edit'
import AttendancesIndex from '@/pages/attendances/index'
import AttendancesNew from '@/pages/attendances/new'
import AttendancesShow from '@/pages/attendances/show'
import ToolEventAssessmentsEdit from '@/pages/tool-event-assessments/edit'
import ToolEventAssessmentsNew from '@/pages/tool-event-assessments/new'
import TeamBulkEvaluationsShow from '@/pages/team_bulk_evaluations/show'

function AppLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<SessionsNew />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayoutRoute />}>
          <Route path="/" element={<PlaceholderHome />} />

          <Route path="/companies" element={<CompaniesIndex />} />
          <Route path="/companies/new" element={<CompaniesNew />} />
          <Route path="/companies/:id" element={<CompaniesShow />} />
          <Route path="/companies/:id/edit" element={<CompaniesEdit />} />

          <Route path="/users" element={<UsersIndex />} />
          <Route path="/users/new" element={<UsersNew />} />
          <Route path="/users/:id" element={<UsersShow />} />
          <Route path="/users/:id/edit" element={<UsersEdit />} />

          <Route path="/chapters" element={<ChaptersIndex />} />
          <Route path="/chapters/new" element={<ChaptersNew />} />
          <Route path="/chapters/:id" element={<ChaptersShow />} />
          <Route path="/chapters/:id/edit" element={<ChaptersEdit />} />

          <Route path="/axes" element={<AxesIndex />} />
          <Route path="/axes/new" element={<AxesNew />} />
          <Route path="/axes/:id" element={<AxesShow />} />
          <Route path="/axes/:id/edit" element={<AxesEdit />} />

          <Route path="/phases" element={<PhasesIndex />} />
          <Route path="/phases/new" element={<PhasesNew />} />
          <Route path="/phases/:id" element={<PhasesShow />} />
          <Route path="/phases/:id/edit" element={<PhasesEdit />} />

          <Route path="/tools" element={<ToolsIndex />} />
          <Route path="/tools/new" element={<ToolsNew />} />
          <Route path="/tools/:id" element={<ToolsShow />} />
          <Route path="/tools/:id/edit" element={<ToolsEdit />} />

          <Route path="/meetings" element={<MeetingsIndex />} />
          <Route path="/meetings/new" element={<MeetingsNew />} />
          <Route path="/meetings/:id" element={<MeetingsShow />} />
          <Route path="/meetings/:id/edit" element={<MeetingsEdit />} />

          <Route path="/clusters" element={<ClustersIndex />} />
          <Route path="/clusters/new" element={<ClustersNew />} />
          <Route path="/clusters/:id" element={<ClustersShow />} />
          <Route path="/clusters/:id/edit" element={<ClustersEdit />} />

          <Route path="/teams" element={<TeamsIndex />} />
          <Route path="/teams/new" element={<TeamsNew />} />
          <Route path="/teams/:id" element={<TeamsShow />} />
          <Route path="/teams/:id/edit" element={<TeamsEdit />} />
          <Route path="/teams/:teamId/members/new" element={<MembersNew />} />
          <Route path="/teams/:teamId/members/:id/edit" element={<MembersEdit />} />
          <Route path="/teams/:teamId/team-bulk-evaluations" element={<TeamBulkEvaluationsShow />} />

          <Route path="/events" element={<EventsIndex />} />
          <Route path="/events/new" element={<EventsNew />} />
          <Route path="/events/:id" element={<EventsShow />} />
          <Route path="/events/:id/edit" element={<EventsEdit />} />
          <Route path="/events/:eventId/attendances" element={<AttendancesIndex />} />
          <Route path="/events/:eventId/attendances/new" element={<AttendancesNew />} />
          <Route path="/events/:eventId/attendances/:id" element={<AttendancesShow />} />
          <Route path="/events/:eventId/attendances/:id/edit" element={<AttendancesEdit />} />
          <Route path="/events/:eventId/tool-event-assessments/new" element={<ToolEventAssessmentsNew />} />
          <Route path="/events/:eventId/tool-event-assessments/:id/edit" element={<ToolEventAssessmentsEdit />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
