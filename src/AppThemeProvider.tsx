import React from 'react'
import { deepPurple } from '@mui/material/colors'
import { CssBaseline } from '@mui/material'
import {
  StyledEngineProvider,
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
  useColorScheme
} from '@mui/material/styles'
import memoizeOne from 'memoize-one'
import { connect } from 'react-redux'
import SettingsActions from 'Redux/Settings/SettingsActions'
import { AppTheme, SystemTheme } from 'Redux/Settings/SettingsTypes'
import { getAppTheme } from 'Redux/Settings/SettingsSelectors'

import type { RootState, AppDispatch } from 'Redux/Store'

function ThemeSwitcher ({ appTheme }: { appTheme: AppTheme }): JSX.Element {
  const { mode, setMode } = useColorScheme()

  React.useEffect(() => {
    let nextMode: 'light' | 'dark'
    switch (appTheme) {
      case AppTheme.Light: nextMode = 'light'; break
      case AppTheme.Dark: nextMode = 'dark'; break
    }
    if (nextMode !== mode) {
      setMode(nextMode)
    }
  })

  return <></>
}

interface Props {
  children: React.ReactNode

  appTheme: AppTheme

  setSystemTheme: (systemTheme: SystemTheme) => void
}

class AppThemeProvider extends React.PureComponent<Props> {
  /* ****************************************************************************/
  // Private
  /* ****************************************************************************/

  #darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

  /* ****************************************************************************/
  // Component lifecycle
  /* ****************************************************************************/

  componentDidMount (): void {
    this.#darkModeQuery.addEventListener('change', this.handleThemeChanged)
  }

  componentWillUnmount (): void {
    this.#darkModeQuery.addEventListener('change', this.handleThemeChanged)
  }

  /* ****************************************************************************/
  // Events
  /* ****************************************************************************/

  handleThemeChanged = (): void => {
    this.props.setSystemTheme(this.#darkModeQuery.matches ? SystemTheme.Dark : SystemTheme.Light)
  }

  /* ****************************************************************************/
  // Theme generation
  /* ****************************************************************************/

  #generateTheme = memoizeOne(() => {
    return extendTheme({
      typography: {
        fontSize: 14,
        button: {
          textTransform: 'none',
          letterSpacing: '0.05em'
        }
      },
      colorSchemes: {
        light: {
          palette: {
            primary: {
              light: deepPurple[300],
              main: deepPurple[500],
              dark: deepPurple[700],
              contrastText: '#fff'
            }
          }
        },
        dark: {
          palette: {
            primary: {
              light: deepPurple[100],
              main: deepPurple[300],
              dark: deepPurple[500],
              contrastText: '#fff'
            }
          }
        }
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            rounded: {
              borderRadius: 10
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            contained: {
              borderRadius: 8,
              boxShadow: 'none',

              '&:hover': {
                boxShadow: 'none'
              }
            },
            outlined: {
              borderRadius: 8
            }
          }
        },
        MuiOutlinedInput: {
          styleOverrides: {
            notchedOutline: {
              borderRadius: 8
            }
          }
        }
      }
    })
  })

  /* ****************************************************************************/
  // Rendering
  /* ****************************************************************************/

  render (): React.ReactElement {
    const { children, appTheme } = this.props

    return (
      <CssVarsProvider theme={this.#generateTheme()}>
        <ThemeSwitcher appTheme={appTheme} />
        <StyledEngineProvider injectFirst>
          <CssBaseline />
          {children}
        </StyledEngineProvider>
      </CssVarsProvider>
    )
  }
}

function mapStateToProps (state: RootState) {
  return {
    appTheme: getAppTheme(state)
  }
}

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  setSystemTheme: (systemTheme: SystemTheme) => dispatch(SettingsActions.setSystemTheme({ systemTheme }))
})

export default connect(mapStateToProps, mapDispatchToProps)(AppThemeProvider)
