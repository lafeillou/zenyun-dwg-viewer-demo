import {LoadingOrError} from 'components/LoadingOrError'
import {lazy, Suspense} from 'react'
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary'
import {Route, Routes} from 'react-router'
import {Viewer} from 'pages/Viewer';

// const Details = lazy(async () =>
// 	import('pages/Details').then(m => ({default: m.Details}))
// )

function renderError({error}: FallbackProps) {
	return <LoadingOrError error={error} />
}

export function App() {
	return (
		<ErrorBoundary fallbackRender={renderError}>
			<Suspense fallback={<LoadingOrError />}>
				<Routes>
					<Route element={<Viewer />} index={true}/>
					{/* <Route element={<Gallery />} index={true} />
					<Route element={<Details />} path=':fruitName' /> */}
				</Routes>
			</Suspense>
		</ErrorBoundary>
	)
}
