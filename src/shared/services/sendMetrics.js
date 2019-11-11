/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { canUseDOM } from 'services/utils'

export const canSendMetrics = () =>
  canUseDOM() && window.neo4jDesktopApi && window.neo4jDesktopApi.sendMetrics

export default function api (...args) {
  if (canSendMetrics()) {
    if (args[0]) {
      args[0] = `>browser--${args[0]}`
    }

    args[1] = {
      appId: 'neo4j-browser',
      ...(typeof args[1] === 'object' && args[1] !== null && args[1])
    }

    window.neo4jDesktopApi.sendMetrics.apply(null, args)
  }
}
